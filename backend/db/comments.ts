import { db } from '../firebase.ts';
import admin from "firebase-admin"; 
import { Comments } from '../types/index.ts';

const fetchRecipeComments = async (recipe_ID : string) => {
  // fetch all comments for a given recipe
  const snapshot = await db
    .collection("comments")
    .where("recipe_ID", "==", recipe_ID)
    .get();

  // map to type Comments
  const allComments: Comments[] = snapshot.docs.map((document) => {
    const data = document.data();
    return {
      id: document.id,
      recipe_ID: data.recipe_ID,
      creator_ID: data.creator_ID,
      content: data.content,
      likes: data.likes || [],
      // Convert Firestore Timestamp to JS Date object
      created_at: data.created_at?.toDate ? data.created_at.toDate() : new Date(data.created_at),
      reply_IDs: data.reply_IDs || [],
      replies: [], // Will fill in next step
    };
  });

  // create a lookup map
  const commentMap = new Map<string, Comments>();
  allComments.forEach(comment => commentMap.set(comment.id, comment));

  const rootComments: Comments[] = [];
  const childCommentIds = new Set<string>();

  // Link replies to their top comments
  for (const comment of allComments) {
    if (comment.reply_IDs && comment.reply_IDs.length > 0) {
      comment.reply_IDs.forEach(replyId => {
        const childComment = commentMap.get(replyId);
        if (childComment) {
          comment.replies.push(childComment);
          childCommentIds.add(replyId); // Track that this is a nested reply
        }
      });
    }
  }

  // filter out the children so only top-level root comments remain
  for (const comment of allComments) {
    if (!childCommentIds.has(comment.id)) {
      rootComments.push(comment);
    }
  }

  return rootComments;
};

// create a new comment
const createComment = async (post : Comments, parent_id: string) => {
  // create new comment
  const docRef = await db.collection("comments").add({
    creator_ID: post.creator_ID,
    content: post.content,
    created_at: admin.firestore.Timestamp.now(), 
    likes: [],
    reply_IDs: [],
    recipe_ID: post.recipe_ID
  });

  // if it is a reply, get the parent and update it
  if (parent_id !== "") {
    const parentRef = db.collection("comments").doc(parent_id.trim());
    await parentRef.update({
      // add reply id to parent comment
      reply_IDs: admin.firestore.FieldValue.arrayUnion(docRef.id)
    });
  }
  return docRef;
}

// update a comment
const updateComment = async (comment : Comments) => {
  const docRef = db.collection("comments").doc(comment.id);
  const firestoreTimestamp = admin.firestore.Timestamp.fromDate(new Date(comment.created_at));

  // Destructure properties to safely strip 'id' and 'replies' before updating
  const { id, replies, ...updateData } = comment;

  await docRef.update({
    ...updateData,
    created_at: firestoreTimestamp,
  });
}

// delete a comment and its replies
const deleteComment = async (comment : Comments, parent_id: string) => {
  // Create a Firestore batch for efficiency
  const batch = db.batch();

  // queue deletions
  if (comment.reply_IDs && comment.reply_IDs.length > 0) {
    comment.reply_IDs.forEach((id: string) => {
      const replyRef = db.collection("comments").doc(id);
      batch.delete(replyRef);
    });
  }

  // add the parent comment deletion
  const commentRef = db.collection("comments").doc(comment.id);
  batch.delete(commentRef);

  // Commit all deletions at once
  await batch.commit();

  // update parent (root) comment if applicable
  if (parent_id !== "") {
    const parentRef = db.collection("comments").doc(parent_id.trim());
    await parentRef.update({
      // add reply id to parent comment
      reply_IDs: admin.firestore.FieldValue.arrayRemove(comment.id)
    });
  }
}


export {createComment, 
  fetchRecipeComments, 
  deleteComment,
  updateComment,
};