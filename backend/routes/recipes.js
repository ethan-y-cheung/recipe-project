import express from "express";
import { db } from "../firebase.ts";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();
const recipesCollection = db.collection("recipes");

// The Recipe interface stores tags as { name, type }. The create form sends
// plain strings, so normalize either shape into Tag objects. Strings have no
// category yet, so they default to type "Custom".
function normalizeTags(tags) {
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

// GET /recipes - list all recipes
router.get("/", async (req, res) => {
    try {
        const snapshot = await recipesCollection.get();
        const recipes = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        res.status(200).json({ recipes });
    } catch (err) {
        console.error("Failed to fetch recipes:", err);
        res.status(500).json({ error: "Failed to fetch recipes" });
    }
});

// GET /recipes/:id - single recipe
router.get("/:id", async (req, res) => {
    try {
        const snapshot = await recipesCollection.doc(req.params.id).get();
        if (!snapshot.exists) {
            return res.status(404).json({ error: "Recipe not found" });
        }
        res.status(200).json({ recipe: { id: snapshot.id, ...snapshot.data() } });
    } catch (err) {
        console.error("Failed to fetch recipe:", err);
        res.status(500).json({ error: "Failed to fetch recipe" });
    }
});

// POST /recipes - create a recipe
router.post("/", requireAuth, async (req, res) => {
    try {
        const {
            title,
            ingredients,
            instructions,
            tags,
            images,
            total_time,
            servings,
        } = req.body;

        // Ownership comes from the verified token, never the request body, so a
        // client can't claim authorship of someone else's recipe. requireAuth
        // guarantees req.user is populated here.
        const creator_ID = req.user.uid;

        // required fields
        if (typeof title !== "string" || title.trim() === "") {
            return res.status(400).json({ error: "title is required" });
        }
        if (!Array.isArray(ingredients) || ingredients.length === 0) {
            return res
                .status(400)
                .json({ error: "ingredients must be a non-empty array" });
        }
        if (!Array.isArray(instructions) || instructions.length === 0) {
            return res
                .status(400)
                .json({ error: "instructions must be a non-empty array" });
        }

        // each ingredient is { name, quantity } where quantity is "qty + units"
        const invalidIngredient = ingredients.find(
            (ing) =>
                typeof ing?.name !== "string" ||
                typeof ing?.quantity !== "string"
        );
        if (invalidIngredient) {
            return res.status(400).json({
                error: "each ingredient must have a string name and quantity",
            });
        }

        // build a document that conforms to the Recipe interface
        const recipe = {
            recipe_ID: "", // filled in with the Firestore doc id below
            user_generated: true,
            creator_ID,
            title: title.trim(),
            created_at: new Date().toISOString(),
            tags: normalizeTags(tags),
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

        const ref = await recipesCollection.add(recipe);
        // use the Firestore doc id as the recipe_ID so the field matches the doc
        await ref.update({ recipe_ID: ref.id });

        res.status(201).json({ recipe: { ...recipe, recipe_ID: ref.id } });
    } catch (err) {
        console.error("Failed to create recipe:", err);
        res.status(500).json({ error: "Failed to create recipe" });
    }
});

export default router;
