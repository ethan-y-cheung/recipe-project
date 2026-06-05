import { db }  from "../firebase.ts";
import type { Recipe } from "../types/index.js"
export async function getRecipesFirebase() : Promise<Recipe[]>
{
    const recipesCollection = db.collection("recipes");
    const snapshot = await recipesCollection.get();
    console.log("shapshot" + snapshot);
    const recipes : Recipe[]= snapshot.docs.map((d : any) => ({
        id: d.id,
        user_generated: true,
        creator_ID: d.data().creator_ID,
        title: d.data().title,
        created_at: d.data().created_at,
        approved: d.data().approved,
        tags: d.data().tags ?? [],
        ingredients: d.data().ingredients,
        instructions: d.data().instructions ?? [],
        images: d.data().images,
        rating: d.data().rating,
        total_time: d.data().total_time ?? null,
        servings: d.data().servings ?? null
        }
    ));
    console.log("recipe" + recipes);
    return recipes;
}

export async function getRecipesFirebaseByID(id: string) : Promise<Recipe | null>
{
    const recipesDoc = db.collection("recipes").doc(id);
    const d = await recipesDoc.get();
    console.log("shapshot" + d);
    if (!d.exists) return null;
    const data = d.data();
    if (!data) return null;
    const recipe : Recipe = {
        id: d.id,
        user_generated: true,
        creator_ID: data.creator_ID ?? null,
        title: data.title,
        created_at: data.created_at,
        approved: data.approved,
        tags: data.tags ?? [],
        ingredients: data.ingredients,
        instructions: data.instructions ?? [],
        images: data.images,
        rating: data.rating,
        total_time: data.total_time ?? null,
        servings: data.servings ?? null
        };
    console.log("recipe" + recipe);
    return recipe;
}

