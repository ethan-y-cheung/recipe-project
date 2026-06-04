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

export default router;
