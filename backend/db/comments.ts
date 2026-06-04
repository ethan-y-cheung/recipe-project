import db from '../firebase.js';
import { doc, collection, getDocs, where, deleteField, writeBatch, addDoc, query, Timestamp, updateDoc } from 'firebase/firestore';
import { Comments } from '../../shared/types/index';

const fetchRecipeComments = async (recipe_ID : string) => {
  // fetch all comments for a given recipe
  const commentsRef = collection(db, "comments");
  const q = query(commentsRef, where("recipe_ID", "==", recipe_ID));
  const querySnapshot = await getDocs(q);

  // map to type Comments
  const allComments: Comments[] = querySnapshot.docs.map((document) => {
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
const createComment = async (post : Comments) => {
  const docRef = await addDoc(collection(db, "comments"), {
    creator_ID: post.creator_ID,
    content: post.content,
    created_at: Timestamp.now(),
    likes: [],
    reply_IDs: [],
    recipe_ID: post.recipe_ID
  });
  return docRef;
}

// update a comment
const updateComment = async (comment : Comments) => {
  const docRef = doc(db, "comment", comment.id);
  const firestoreTimestamp = Timestamp.fromDate(new Date(comment.created_at));
  await updateDoc(docRef, {...comment, 
    created_at: firestoreTimestamp,
    replies: deleteField(),
    id: deleteField()}); // should have handled any other updates earlier
}

// delete a comment and its replies
const deleteComment = async (comment : Comments) => {
  // Create a Firestore batch for efficiency
  const batch = writeBatch(db);

  // queue deletions
  if (comment.reply_IDs && comment.reply_IDs.length > 0) {
    comment.reply_IDs.forEach((id : string) => {
      const replyRef = doc(db, "comments", id);
      batch.delete(replyRef);
    });
  }

  // add the parent comment deletion
  const commentRef = doc(db, "comments", comment.id);
  batch.delete(commentRef);

  // Commit all deletions at once
  await batch.commit();
}


export {createComment, 
  fetchRecipeComments, 
  deleteComment,
  updateComment,
};