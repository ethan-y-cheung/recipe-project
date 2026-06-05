import express, { Request, Response} from 'express';

import type {Recipe} from "../../shared/types/index.js"
import { requireAuth } from '../middleware/auth.js';
import { db } from "../firebase.ts";

import { getRecipesFirebase, getRecipesFirebaseByID } from "../db/recipe.js";
import { getRecipesTheMealDB, getRecipeMealDBById} from "../services/recipe.js"
import type { Tag, User } from "../../shared/types/index.ts";
const router = express.Router();

const MAX_RECIPES_TMDB = 10;



// The Recipe interface stores tags as { name, type }. The create form sends
// plain strings, so normalize either shape into Tag objects. Strings have no
// category yet, so they default to type "Custom".
function normalizeTags(tags : Tag[]) {
    if (!Array.isArray(tags)) return [];
    return tags
        .map((tag) => {
            if (typeof tag === "string") {
                return { name: tag, type: "Custom" };
            }
            if (tag && typeof tag.name === "string") {
                return {
                    name: tag.name,
                    type: typeof tag.type === "string" ? tag.type : "Custom",
                };
            }
            return null;
        })
        .filter(Boolean);
}


//get just from firebase
router.get("/firebase", async (req, res) => {
    const recipes = await getRecipesFirebase();
    res.json(recipes);
});

//get just from mealdb
router.get("/mealdb", async (req, res) => {
    const recipes = await getRecipesTheMealDB(1);
    res.json(recipes);
});
// Unified get ALL Recipes
router.get("/", requireAuth, async (req, res): Promise<void> => {
    try {
        const [firebaseRes, theMealDBRes] = await Promise.all([
            getRecipesFirebase(),
            getRecipesTheMealDB(MAX_RECIPES_TMDB)
        ]);
        // console.log("firebaseRes", firebaseRes);
        // console.log("theMealDBRes", theMealDBRes)
        res.json([...firebaseRes, ...theMealDBRes]);
        
    } catch (err) {
        console.error("Failed to fetch recipes:", err);
        res.status(500).json({ error: "Failed to fetch recipes" });
    }
});



//get by id just from firebase (for testing)
router.get("/firebase/:id", requireAuth, async (req, res) => {
    try {
        const { id } = req.params;

        const recipe = await getRecipesFirebaseByID(id);

        if (!recipe) {
            return res.status(404).json({ error: "Firebase recipe not found" });
        }

        res.json(recipe);
    } catch (err) {
        console.error("Firebase by ID failed:", err);
        res.status(500).json({ error: "Failed to fetch Firebase recipe" });
    }
});

//get by id just from mealdb (for testing)
router.get("/mealdb/:id", async (req, res) => {
    // console.log("meal db by id route called");
    try {
        const { id } = req.params;

        const recipe = await getRecipeMealDBById(id);

        if (!recipe) {
            return res.status(404).json({ error: "Firebase recipe not found" });
        }

        res.json(recipe);
    } catch (err) {
        console.error("MealDB by ID failed:", err);
        res.status(500).json({ error: "Failed to fetch MealDB recipe" });
    }
});

//Unified get recipe by id
router.get("/single/:id", async (req, res): Promise<void> => {
    try {
        const { id } = req.params;

        const recipe = await getRecipeById(id);

        if (!recipe) {
            res.status(404).json({ error: "Recipe not found" });
            return;
        }

        res.json(recipe);
    } catch (err) {
        console.error("Route /recipes/single/:id failed:", err);
        res.status(500).json({ error: "Failed to fetch recipe" });
    }
});

export async function getRecipeById(id: string): Promise<Recipe | null> {
    try {
        //try firebase first
        const firebaseRecipe = await getRecipesFirebaseByID(id);
        if (firebaseRecipe) {
            return firebaseRecipe;
        }

        //if not try meal db
        const mealDBRecipe = await getRecipeMealDBById(id);
        if (mealDBRecipe) {
            return mealDBRecipe;
        }

        //if not return null
        return null;
    } catch (err) {
        console.error("getRecipeById failed:", err);
        return null;
    }
}
// POST /recipes - create a recipe
router.post("/", requireAuth, async (req : Request<{}, {}, {recipe: Recipe}>, res : Response): Promise<void> => {
    try {
        const { recipe } = req.body;
        const {
            title,
            creator_ID,
            ingredients,
            instructions,
            tags,
            images,
            total_time,
            servings,
        } = recipe;

        // Ownership comes from the verified token, never the request body, so a
        // client can't claim authorship of someone else's recipe. requireAuth
        // guarantees req.user is populated here. We store the username (not the
        // uid) as creator_ID because that's what getCreatedRecipes queries by
        // and how seeded recipes are keyed; the users doc id is the uid.

        // required fields
        if (typeof title !== "string" || title.trim() === "") {
            res.status(400).json({ error: "title is required" });
            return
        }
        if (!Array.isArray(ingredients) || ingredients.length === 0) {
            res
            .status(400)
            .json({ error: "ingredients must be a non-empty array" });
            return;
        }
        if (!Array.isArray(instructions) || instructions.length === 0) {
            res
            .status(400)
            .json({ error: "instructions must be a non-empty array" });
            return;
        }

        // each ingredient is { name, quantity } where quantity is "qty + units"
        const invalidIngredient = ingredients.find(
            (ing) =>
                typeof ing?.name !== "string" ||
                typeof ing?.quantity !== "string"
        );
        if (invalidIngredient) {
            res.status(400).json({
                error: "each ingredient must have a string name and quantity",
            });
            return;
        }

        // build a document that conforms to the Recipe interface
        const newRecipe = {
            recipe_ID: "", // filled in with the Firestore doc id below
            user_generated: true,
            creator_ID,
            title: title.trim(),
            created_at: new Date().toISOString(),
            tags: normalizeTags(tags),
            approved: false,
            ingredients: ingredients.map((ing) => ({
                name: ing.name,
                quantity: ing.quantity, // "qty + units", e.g. "2 cups"
            })),
            instructions,
            // Positional images: index 0 is the cover, indices 1..N align to the
            // direction steps. Each entry is a permanent S3 fileKey (resolved to a
            // signed view URL at display time) or null where a step has no image.
            // Keep nulls so the step<->image alignment never drifts.
            images: Array.isArray(images)
                ? images.map((key) => (typeof key === "string" ? key : null))
                : [],
            rating: [],
            total_time: typeof total_time === "string" ? total_time : null,
            servings: typeof servings === "number" ? servings : null,
        };

        const ref = await db.collection("recipes").add(newRecipe);

        res.status(201).json({ recipe: { ...recipe, id: ref.id } });
    } catch (err) {
        console.error("Failed to create recipe:", err);
        res.status(500).json({ error: "Failed to create recipe" });
    }
});

export default router;
