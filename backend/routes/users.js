import express from 'express';
import admin from 'firebase-admin';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// POST /users/sync — create Firestore user document if it doesn't exist
router.post('/sync', requireAuth, async (req, res) => {
  const { uid, email } = req.user;
  const { username } = req.body;

  try {
    const db = admin.firestore();
    const userRef = db.collection('users').doc(uid);
    const snap = await userRef.get();

    if (!snap.exists()) {
      await userRef.set({
        username: username || email?.split('@')[0],
        email,
        admin: false,
        my_recipes: [],
        saved_recipes: [],
      });
    }

    res.json({ message: 'User synced' });
  } catch (err) {
    console.error('User sync error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /users/me — fetch the current user's Firestore document
router.get('/me', requireAuth, async (req, res) => {
  const { uid } = req.user;

  try {
    const db = admin.firestore();
    const snap = await db.collection('users').doc(uid).get();

    if (!snap.exists()) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ id: snap.id, ...snap.data() });
  } catch (err) {
    console.error('Fetch user error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
