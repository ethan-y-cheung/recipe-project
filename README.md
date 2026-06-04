# Recipe Project

## Setup

### Frontend
1. Create `frontend/.env` with your Firebase config:
```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_API_URL=http://localhost:5000
```
2. `cd frontend && npm install && npm run dev`

### Backend
1. Create `backend/.env` with the following:
```
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
FRONTEND_URL=http://localhost:5173
```
Get `FIREBASE_CLIENT_EMAIL` and `FIREBASE_PRIVATE_KEY` from Firebase console → Project Settings → Service accounts → Generate new private key.

2. `cd backend && npm install && npm start`

---

## Making the First Admin

Admin status is set via a Firebase custom claim. Since there are no admins initially, use the bootstrap script:

```bash
cd backend
node scripts/makeAdmin.js your@email.com
```

The user must already have an account (registered through the app) before running this. After running the script, they need to sign out and back in for the new token with the admin claim to take effect.

Once there is at least one admin, they can promote others through the app via `POST /admin/set-admin`.

---

## Auth Overview

- Authentication is handled by Firebase Auth (email/password and Google)
- On first sign-in, a user document is created in Firestore under `users/{uid}`
- Admin status is stored as a custom claim on the Firebase Auth token, not in Firestore
- Protected routes: Create Recipe and My Recipes require login, Admin page requires admin claim
- Backend protected routes use `requireAuth` and `requireAdmin` middleware in `backend/middleware/auth.js`
