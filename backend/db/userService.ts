import {
    collection,
    doc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    query,
    where,
} from "firebase/firestore";
import db from "../firebase.js";
import { Recipe } from "../../shared/types/index.ts";

export const getCreatedRecipes = async (
    username: string,
): Promise<Recipe[]> => {
    const q = query(
        collection(db, "recipes"),
        where("creator_ID", "==", username),
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    })) as Recipe[];
};

export const getSavedRecipes = async (
    username: string,
): Promise<string[] | null> => {
    const snapshot = await getDoc(doc(db, "users", username));

    if (!snapshot.exists()) return null;

    const userData = snapshot.data();
    const savedRecipes = userData?.saved_recipes || [];

    return savedRecipes.map((item: any) => item.recipe_id);
};
