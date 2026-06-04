import { Router } from "express";
import { getSavedRecipes, getCreatedRecipes } from "../db/userService.ts";
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

export default router;
