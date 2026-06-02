import { useState } from 'react';
import type { Comments } from "../../../shared/types/index.ts";
import "../styles/RecipeDetail.css";

interface CommentProps {
  username: string
}

const CommentForm = ( {username} : CommentProps) => {
  const [formError, setFormError] = useState<boolean>(false);

  const [commentData, setCommentData] = useState<Comments>({
    recipe_ID: "", creator_ID: username, content: "", likes: [], created_at: new Date(), replies: []
  });

  const submitForm = async () => {
    setFormError(commentData.content==="");
    if (commentData.creator_ID==="" || commentData.content === "") return;

    const tempComment: Comments = {
      recipe_ID: "",
      creator_ID: commentData.creator_ID,
      content: commentData.content,
      created_at: new Date(),
      likes: [],
      replies: [],
    }

    // database interaction here
    console.log(tempComment);
    try {
      setCommentData({...commentData, content: ""})
    } catch (error) {
      console.error("Error in submitting comment: ", error);
    }
    
    return
  }

  return (
    <div className="comment-form">
      <h2>Comment</h2> 

      <div style={{display: "flex", flexDirection: "column", alignItems: "start", width: "100%"}}>
        <span style={{fontSize: "0.875rem"}}>Message</span>
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