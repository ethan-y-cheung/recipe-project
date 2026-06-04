// import {
//     collection,
//     doc,
//     getDoc,
//     getDocs,
//     updateDoc,
//     deleteDoc,
//     query,
//     where,
// } from "firebase/firestore";

// import db from "../firebase.js";
// import { User, Recipe } from "../../shared/types/index.ts";

// export const getUserById = async (username: string) => {
//     const docRef = doc(db, "users", username);

//     const snapshot = await getDoc(docRef);
//     if (!snapshot.exists()) return null;

//     return snapshot.data() as User;
// };

// export const getCreatedRecipes = async (username: string) => {
//     const snapshot = await getDocs(
//         collection(db, "recipes"),
//         where("creator_ID", "==", username),
//     );

//     return snapshot.docs.map((doc) => ({
//         recipe_ID: doc.id,
//         ...doc.data(),
//     })) as Recipe[];
// };
