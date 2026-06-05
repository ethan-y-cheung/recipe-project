import express from 'express';
import admin from 'firebase-admin';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// POST /admin/set-admin — grant or revoke admin for a user (admin only)
router.post('/set-admin', requireAuth, requireAdmin, async (req, res) => {
  const { uid, isAdmin } = req.body;

  if (!uid || typeof isAdmin !== 'boolean') {
    return res.status(400).json({ error: 'uid and isAdmin (boolean) are required' });
  }

  try {
    await admin.auth().setCustomUserClaims(uid, { admin: isAdmin });
    res.json({ message: `User ${uid} admin status set to ${isAdmin}` });
  } catch (err) {
    console.error('Set admin error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /admin/pending-recipes — fetch all unapproved recipes
router.get('/pending-recipes', requireAuth, requireAdmin, async (req, res) => {
  try {
    const db = admin.firestore();
    const snapshot = await db.collection('recipes').where('approved', '==', false).get();
    const recipes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(recipes);
  } catch (err) {
    console.error('Fetch pending recipes error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /admin/recipes/:id/approve — approve a recipe
router.patch('/recipes/:id/approve', requireAuth, requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const db = admin.firestore();
    await db.collection('recipes').doc(id).update({ approved: true });
    res.json({ message: 'Recipe approved' });
  } catch (err) {
    console.error('Approve recipe error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /admin/recipes/:id — deny and delete a recipe
router.delete('/recipes/:id', requireAuth, requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const db = admin.firestore();
    await db.collection('recipes').doc(id).delete();
    res.json({ message: 'Recipe deleted' });
  } catch (err) {
    console.error('Deny recipe error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
