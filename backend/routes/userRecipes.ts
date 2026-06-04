import { Router } from "express";
import {
    getSavedRecipes,
    getCreatedRecipes,
    updateCreatedRecipe,
    deleteCreatedRecipe,
    removeSavedRecipe,
} from "../db/userService.ts";
import { fetchMultipleRecipes } from "../services/recipeService.ts";
// import { requireAuth } from "../middleware/auth.js"

const router = Router();

router.get("/:username/created", async (req, res) => {
    try {
        const { username } = req.params;
        if (!username) {
            return res.status(400).json({ error: "missing username" });
        }

        const createdRecipes = await getCreatedRecipes(username);

        return res.status(200).json(createdRecipes);
    } catch (error: any) {
        console.error("Failed to fetch created recipes: ", error);
        return res
            .status(500)
            .json({ message: "Failed to fetch created recipes: ", error });
    }
});

router.get("/:username/saved", async (req, res) => {
    try {
        const { username } = req.params;
        if (!username) {
            return res.status(400).json({ error: "missing username" });
        }

        const savedIds = await getSavedRecipes(username);

        if (savedIds === null) {
            return res.status(404).json({ message: "user not found" });
        }
        if (savedIds.length === 0) {
            return res.status(200).json([]);
        }

        const savedRecipes = await fetchMultipleRecipes(savedIds);

        return res.status(200).json(savedRecipes);
    } catch (error: any) {
        console.error("Failed to fetch saved recipes: ", error);
        return res.status(500).json({
            messsage: "Failed to fetch saved recipes: ",
            error,
        });
    }
});

router.put("/recipes/:recipeId", async (req, res) => {
    try {
        const { recipeId } = req.params;
        const { username, updatedFields } = req.body;

        if (!username) {
            return res.status(400).json({
                message:
                    "Missing required 'username' in request body to verify ownership.",
            });
        }

        const success = await updateCreatedRecipe(
            recipeId,
            username,
            updatedFields || req.body,
        );

        if (!success) {
            return res
                .status(404)
                .json({ message: "Target recipe index record not found." });
        }

        return res
            .status(200)
            .json({ message: "Recipe modified successfully." });
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : "Internal error";
        if (msg.includes("Unauthorized")) {
            return res.status(403).json({ message: msg });
        }
        return res
            .status(500)
            .json({ message: "Failed to update recipe.", error: msg });
    }
});

router.delete("/recipes/:recipeId", async (req, res) => {
    try {
        const { recipeId } = req.params;
        const username = (req.query.username as string) || req.body.username;

        if (!username) {
            return res.status(400).json({
                message:
                    "Missing required 'username' parameter to verify ownership.",
            });
        }

        const success = await deleteCreatedRecipe(recipeId, username);

        if (!success) {
            return res
                .status(404)
                .json({ message: "Target recipe index record not found." });
        }

        return res.status(200).json({ message: "Recipe permanently deleted." });
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : "Internal error";
        if (msg.includes("Unauthorized")) {
            return res.status(403).json({ message: msg });
        }
        return res
            .status(500)
            .json({ message: "Failed to delete recipe.", error: msg });
    }
});

router.delete("/:username/saved/:recipeId", async (req, res) => {
    try {
        const { username, recipeId } = req.params;

        const success = await removeSavedRecipe(username, recipeId);

        if (!success) {
            return res.status(404).json({
                message:
                    "Recipe wasn't found in your saved list or user profile doesn't exist.",
            });
        }

        return res.status(200).json({
            message: "Recipe removed from your saved dashboard successfully.",
        });
    } catch (error: unknown) {
        const msg =
            error instanceof Error ? error.message : "Internal server fault";
        return res
            .status(500)
            .json({ message: "Failed to remove saved recipe.", error: msg });
    }
});

export default router;
