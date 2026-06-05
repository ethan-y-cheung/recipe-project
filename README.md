# Open Table

## Project Description

A recipe sharing platform where you can discover, create, save, and talk about recipes. It has both official recipes and ones made by the community, along with user accounts, image uploads, an AI cooking assistant, and an admin panel for reviewing new recipes.

## Table of Contents

- [Installation](#installation)
- [How to Use](#how-to-use)
- [Major Components and Features](#major-components-and-features)
- [Credits](#credits)

## Installation

### Prerequisites

- Node.js v18+
- A Firebase project (Firestore and Authentication enabled)
- An AWS S3 bucket (for image uploads)
- An OpenAI API key (for the AI chat feature)

### Backend Setup

1. Navigate to the backend folder:

   ```bash
   cd backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the `backend` folder:

   ```
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_CLIENT_EMAIL=your-client-email
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   FRONTEND_URL=http://localhost:5173
   OPENAI_API_KEY=your-openai-api-key
   AWS_ACCESS_KEY_ID=your-aws-key
   AWS_SECRET_ACCESS_KEY=your-aws-secret
   AWS_REGION=your-region
   AWS_BUCKET_NAME=your-bucket-name
   ```

   You can get `FIREBASE_CLIENT_EMAIL` and `FIREBASE_PRIVATE_KEY` from the Firebase console under Project Settings > Service accounts > Generate new private key.

   Important: `import "dotenv/config"` must be the first line in `backend/app.js`. This is required because Firebase Admin initializes when route files are imported, which happens before `dotenv.config()` would run if placed later. Do not change this.

4. Start the backend:
   ```bash
   npm start
   ```
   The server runs on port 5000 by default.

### Frontend Setup

1. Navigate to the frontend folder:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the `frontend` folder:

   ```
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   VITE_API_URL=http://localhost:5000
   ```

4. Start the frontend:
   ```bash
   npm run dev
   ```
   The app runs at `http://localhost:5173`.

### Making the First Admin

Admin status is stored as a Firebase custom claim. Once a user has registered through the app, run this script to give them admin access:

```bash
cd backend
node scripts/makeAdmin.js your@email.com
```

They will need to sign out and back in after for the change to take effect. Once there is at least one admin, they can promote other users through the app.

## How to Use

1. **Sign up or log in** using email/password or Google sign-in.
2. **Browse recipes** from the Recipes page and filter by meal type, dietary restrictions, or search by name.
3. **View a recipe** to see ingredients, instructions, ratings, and comments.
4. **Create a recipe** by filling out the form with a title, ingredients, directions, tags, and an optional cover image. Directions can be reordered by dragging.
5. **Save recipes** to your profile using the bookmark button on a recipe page.
6. **Rate and comment** on recipes you have tried.
7. **Use the AI chat** on any recipe page to ask cooking questions.
8. **Admin users** can review and approve or reject community recipes from the Admin panel.

## Major Components and Features

| Feature                                                     | Status                                                           |
| ----------------------------------------------------------- | ---------------------------------------------------------------- |
| User authentication (email/password + Google)               | Complete                                                         |
| User profile synced to Firestore on login                   | Complete                                                         |
| Auth context (currentUser, userData, isAdmin)               | Complete                                                         |
| Recipe browsing page with search, filtering, and pagination | Complete                                                         |
| Save and unsave recipes                                     | Complete                                                         |
| Recipe detail page                                          | In progress (recipe data hardcoded, comments fetch from backend) |
| Create recipe form with drag-and-drop direction reordering  | Complete                                                         |
| Image uploads via AWS S3                                    | Complete                                                         |
| Comments (post, delete, reply)                              | In progress (backend complete, frontend partially connected)     |
| Recipe ratings                                              | In progress (UI complete, not yet saved to backend)              |
| AI cooking assistant                                        | Complete                                                         |
| Admin moderation panel                                      | Complete                                                         |
| My Recipes page                                             | In progress                                                      |

## Auth Overview

- Authentication is handled by Firebase Auth (email/password and Google)
- On first sign-in, a user document is created in Firestore under `users/{uid}`
- Admin status is stored as a custom claim on the Firebase Auth token, not in Firestore
- Protected routes: Create Recipe and My Recipes require login, Admin page requires admin claim
- Backend protected routes use `requireAuth` and `requireAdmin` middleware in `backend/middleware/auth.js`

## Credits

Built by:

- Yuwen Zhang
- Angelina Rodriguez
- Emily Middleton
- Sajid Islam
- Vincent Chan
- Ethan Cheung
