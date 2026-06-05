import express from 'express';
import admin from 'firebase-admin';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Helper function: Create user document if it doesn't exist
async function ensureUserDoc(uid, email, username) {
  const db = admin.firestore();
  const userRef = db.collection("users").doc(uid);

  const snap = await userRef.get();

  if (!snap.exists) {
    await userRef.set({
      username: username || email?.split("@")[0],
      email,
      admin: false,
      my_recipes: [],
      saved_recipes: [],
    });
  }

  return userRef;
}

// Sync firestore on login - creates document if not exists
router.post("/sync", requireAuth, async (req, res) => {
  const { uid, email } = req.user;
  const { username } = req.body;

  try {
    await ensureUserDoc(uid, email, username);

    return res.json({
      message: "User synced",
    });
  } catch (err) {
    console.error("User sync error:", err);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
});

// Add recipe to saved_recipes
router.post("/saved-recipes/:recipe_id", requireAuth, async (req, res) => {
  const { uid, email, username } = req.user;
  const { recipe_id } = req.params

  try {
    const userRef = await ensureUserDoc(uid, email, username);
    const userSnap = await userRef.get();

    const userData = userSnap.data() || {};
    const savedRecipes = userData.saved_recipes || [];

    const alreadyExists = savedRecipes.some(
      (savedRecipe) => savedRecipe.recipe_id === recipe_id
    );

    if (alreadyExists) {
      return res.status(400).json({
        error: "Recipe already exists in saved",
      });
    }

    await userRef.set(
      {
        saved_recipes: [...savedRecipes, { recipe_id, notes: '' }],
      },
      { merge: true }
    );

    const updatedSnap = await userRef.get();
    return res.json({ id: updatedSnap.id, ...updatedSnap.data() });
  } catch (err) {
    console.error("Save recipe error:", err);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
});

// Delete recipe from saved_recipes
router.delete("/saved-recipes/:recipe_id", requireAuth, async (req, res) => {
  const { uid, email, username } = req.user;
  const { recipe_id } = req.params;

  try {
    const userRef = await ensureUserDoc(uid, email, username);
    const userSnap = await userRef.get();

    const userData = userSnap.data() || {};
    const savedRecipes = userData.saved_recipes || [];

    const recipeExists = savedRecipes.some(
      (recipe) => recipe.recipe_id === recipe_id
    );

    if (!recipeExists) {
      return res.status(404).json({
        error: "Recipe not found",
      });
    }

    const updatedSavedRecipes = savedRecipes.filter(
      (recipe) => recipe.recipe_id !== recipe_id
    );

    await userRef.set(
      {
        saved_recipes: updatedSavedRecipes,
      },
      { merge: true }
    );

    const updatedSnap = await userRef.get();
    return res.json({ id: updatedSnap.id, ...updatedSnap.data() });
  } catch (err) {
    console.error("Delete recipe error:", err);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
});

// GET /users/me — fetch the current user's Firestore document
router.get('/me', requireAuth, async (req, res) => {
  const { uid } = req.user;

  try {
    const db = admin.firestore();
    const snap = await db.collection('users').doc(uid).get();

    if (!snap.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ id: snap.id, ...snap.data() });
  } catch (err) {
    console.error('Fetch user error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /users/me — update the current user's Firestore document
router.put('/me', requireAuth, async (req, res) => {
  const { uid } = req.user; // Extracted from requireAuth middleware
  const updatedData = req.body; // The user details passed from the frontend

  try {
    const db = admin.firestore();
    const userRef = db.collection('users').doc(uid);
    const snap = await userRef.get();

    // 1. Check if the user document exists before updating
    if (!snap.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    // 2. Perform the update with the fields sent from the frontend
    await userRef.update(updatedData);

    // 3. Fetch the fresh, updated user document data to send back
    const updatedSnap = await userRef.get();

    res.json({ id: updatedSnap.id, ...updatedSnap.data() });
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
