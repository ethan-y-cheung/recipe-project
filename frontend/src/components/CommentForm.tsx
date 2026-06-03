import { useState } from 'react';
import type { Comments } from "../../../shared/types/index.ts";
import "../styles/RecipeDetail.css";

interface CommentProps {
  username: string;
  recipe_ID: string;
  // updatePosts: React.Dispatch<React.SetStateAction<Comments[]>>;
  updatePosts: (newComment : Comments) => void;
  allPosts: Comments[];
}

const CommentForm = ( {recipe_ID, username, updatePosts, allPosts} : CommentProps) => {
  const [formError, setFormError] = useState<boolean>(false);

  const [commentData, setCommentData] = useState<Comments>({
    id: "", recipe_ID: recipe_ID, creator_ID: username, content: "", likes: [], created_at: new Date(), replies: []
  });

  const submitForm = async () => {
    setFormError(commentData.content==="");
    if (commentData.creator_ID==="" || commentData.content === "") return;

    const tempComment: Comments = commentData;

    
    try {
      // database interaction here
      console.log(tempComment);
      updatePosts(tempComment);
      // updatePosts([...allPosts, tempComment]);
    } catch (error) {
      // undo state change
      // updatePosts([...allPosts]);
      console.error("Error in submitting comment: ", error);
    } finally {
      // clear out text
      setCommentData({...commentData, content: ""});
    }
    
    return
  }

  return (
    <div className="comment-form">
      <h2>Comment</h2> 

      <div className="comment-container">
        <span className="helper-text">Message</span>
        <textarea 
          className={`${formError ? "error" : ""} comment-form-text`}
          placeholder="Turn the heat down by 35 degrees..."
          value={commentData.content}
          onChange={(e) => setCommentData({...commentData, content: e.target.value})}
        />
      </div>

      <button onClick={submitForm} className="submit-button">Submit</button>
    </div>
  );
}
export default CommentForm;