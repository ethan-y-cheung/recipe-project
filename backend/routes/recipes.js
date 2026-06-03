import express from "express";
import {
    collection,
    addDoc,
    getDocs,
    getDoc,
    doc,
} from "firebase/firestore";
import db from "../firebase.js";

const router = express.Router();
const recipesCollection = collection(db, "recipes");

// GET /recipes - list all recipes
router.get("/", async (req, res) => {
    try {
        const snapshot = await getDocs(recipesCollection);
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
        const snapshot = await getDoc(doc(db, "recipes", req.params.id));
        if (!snapshot.exists()) {
            return res.status(404).json({ error: "Recipe not found" });
        }
        res.status(200).json({ recipe: { id: snapshot.id, ...snapshot.data() } });
    } catch (err) {
        console.error("Failed to fetch recipe:", err);
        res.status(500).json({ error: "Failed to fetch recipe" });
    }
});

// POST /recipes - create a recipe
router.post("/", async (req, res) => {
    try {
        const ref = await addDoc(recipesCollection, req.body);
        res.status(201).json({ id: ref.id });
    } catch (err) {
        console.error("Failed to create recipe:", err);
        res.status(500).json({ error: "Failed to create recipe" });
    }
});

export default router;
