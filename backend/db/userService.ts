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

import { db } from "../firebase.ts";
import admin from "firebase-admin";
import { Recipe } from "../../shared/types/index.ts";

export const getCreatedRecipes = async (
    username: string,
): Promise<Recipe[]> => {
    const snapshot = await db
        .collection("recipes")
        .where("creator_ID", "==", username)
        .get();

    return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    })) as Recipe[];
};

export const getSavedRecipes = async (
    username: string,
): Promise<string[] | null> => {
    const snapshot = await db
        .collection("users")
        .where("username", "==", username)
        .get();

    if (snapshot.empty) {
        console.warn(`No user found with : ${username}`);
        return null;
    }

    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();
    const savedRecipes = userData?.saved_recipes || [];

    return savedRecipes.map((item: { recipe_id: string }) => item.recipe_id);
};
