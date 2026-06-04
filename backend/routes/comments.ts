import 'dotenv/config';
import express, { Request, Response} from 'express';
import { Comments } from '../../shared/types/index.ts';
import { createComment, fetchRecipeComments, deleteComment, updateComment } from "../db/comments.ts";

const router = express.Router();

interface RequestBody {
  comment: Comments;
}

// endpoint to post a new comment
router.post("/", async (req : Request<{}, {}, RequestBody>, res : Response): Promise<void> => {
  try {
    const { comment } = req.body;

    if (!comment.creator_ID || !comment.content || !comment.recipe_ID ) {
      res.status(400).json({ error: 'creator, content, and recipe id are all required' });
      return;
    }

    const docRef = await createComment(comment);
    res.status(201).json(docRef);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Failed to post a new comment in backend:", errorMessage);
    res.status(500).json({ error: "Internal server error in posting comment"} );
  }
})

// endpoint to update an old comment
router.put("/", async (req : Request<{}, {}, RequestBody>, res : Response): Promise<void> => {
  try {
    const {comment} = req.body;
    await updateComment(comment);
    res.status(200).json({success: true})
    return;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Failed to update the comment in backend:", errorMessage);
    res.status(500).json({ error: "Internal server error in updating comment"} );
  }
})

// endpoint to delete a comment and its replies
router.post("/delete", async (req : Request<{}, {}, RequestBody>, res : Response): Promise<void> =>  {
  const { comment } = req.body;
  if (!comment) {
    res.status(400).json({error: 'the comment is required'});
    return;
  }
  try {
    await deleteComment(comment);
    res.status(200).json({success: true})
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Failed to delete the comment or replies in backend:", errorMessage);
    res.status(500).json({ error: "Internal server error in deleting comment"} );
  }
})


// endpoint to grab all comments by recipe id
// Request<Params, ResBody, ReqBody, ReqQuery>
router.get("/", async (req : Request<{}, {}, {}, {recipe_ID? : string}>, res : Response): Promise<void> => {
  try {
    const { recipe_ID } = req.query;
    if (typeof recipe_ID !== 'string') {
      res.status(400).json({ message: "recipe_ID query parameter is required" });
      return; 
    }
    const posts = await fetchRecipeComments(recipe_ID);
    res.status(200).json(posts)
  } catch (error) {
    res.status(500).json({message: "Error retrieving posts"});
  }
});


export default router;