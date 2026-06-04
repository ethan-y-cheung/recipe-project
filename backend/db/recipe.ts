import db  from "../firebase.js";
import {collection, doc, getDocs, getDoc} from "firebase/firestore"
import type { Recipe } from "../../shared/types/index.js"
export async function getRecipesFirebase() : Promise<Recipe[]>
{
    const recipesCollection = collection(db, "recipes");
    const snapshot = await getDocs(recipesCollection);
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
    const recipesDoc = doc(db, "recipes", id);
    const d = await getDoc(recipesDoc);
    console.log("shapshot" + d);
    if (!d.exists()) return null;
    const recipe : Recipe = {
        id: d.id,
        user_generated: true,
        creator_ID: d.data().creator_ID ?? null,
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
        };
    console.log("recipe" + recipe);
    return recipe;
}

