import { db } from "../firebase.ts";
import { FieldValue } from "firebase-admin/firestore";
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

export const updateCreatedRecipe = async (
    recipeId: string,
    username: string,
    updatedFields: Partial<Recipe>,
): Promise<boolean> => {
    const recipeRef = db.collection("recipes").doc(recipeId);
    const doc = await recipeRef.get();

    if (!doc.exists) return false;

    const recipeData = doc.data();
    if (recipeData?.creator_ID !== username) {
        throw new Error("Unauthorized: You do not own this recipe record.");
    }

    const { id, creator_ID, created_at, ...allowedUpdates } =
        updatedFields as any;

    await recipeRef.update({
        ...allowedUpdates,
        updated_at: new Date().toISOString(),
    });

    return true;
};

export const deleteCreatedRecipe = async (
    recipeId: string,
    username: string,
): Promise<boolean> => {
    const recipeRef = db.collection("recipes").doc(recipeId);
    const doc = await recipeRef.get();

    if (!doc.exists) return false;

    const recipeData = doc.data();
    if (recipeData?.creator_ID !== username) {
        throw new Error("Unauthorized: You do not own this recipe record.");
    }

    await recipeRef.delete();
    return true;
};

export const removeSavedRecipe = async (
    username: string,
    recipeId: string,
): Promise<boolean> => {
    const userQuerySnapshot = await db
        .collection("users")
        .where("username", "==", username)
        .get();

    if (userQuerySnapshot.empty) return false;

    const userDoc = userQuerySnapshot.docs[0];
    const userData = userDoc.data();
    const savedRecipes: Array<{ recipe_id: string; notes?: string }> =
        userData?.saved_recipes || [];

    const targetMapObject = savedRecipes.find(
        (item) => item.recipe_id === recipeId,
    );

    if (!targetMapObject) {
        return false;
    }

    await userDoc.ref.update({
        saved_recipes: FieldValue.arrayRemove(targetMapObject),
    });

    return true;
};
