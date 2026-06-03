import "../styles/RecipeDetail.css";
import { ThumbsUp, Reply } from 'lucide-react';
import type { Comments } from "../../../shared/types/index.ts";
import {formatDistanceToNow} from 'date-fns';
import { useState } from 'react';

interface DiscussionProps {
  username: string;
  comments: Comments[];
}


const Discussion = ( {comments} : DiscussionProps) => {
  const [openReply, setOpenReply] = useState<boolean>(false);

  return (
    <>
      <h2 className="section-title">Discussion</h2>
      <div className="discussion-container">
          {comments.map((comment, index) => (
            <article key={index}>
              <div className="comment"> 
                <p style={{color: "black"}}><strong>{comment.creator_ID}</strong></p>
                <p>{formatDistanceToNow(comment.created_at, { addSuffix: true })}</p>
                <p className="comment-content">{comment.content}</p>
                <div className="comment-footer"> 
                  <p>{comment.likes.length}</p>
                  <ThumbsUp />
                  <button className="reply-button"> <Reply/>reply </button>
                </div>
              </div>
              {comment.replies[0] ? <section className="replies">
                {comment.replies.map(reply => (<div className="comment">
                  <p style={{color: "black"}}><strong>{reply.creator_ID}</strong></p>
                  <p>{formatDistanceToNow(reply.created_at, { addSuffix: true })}</p>
                  <p className="comment-content">{reply.content}</p>
                  <div className="comment-footer"> 
                    <p>{reply.likes.length}</p>
                    <ThumbsUp />
                    <button className="reply-button"> <Reply/>reply </button>
                  </div>
                </div>))}
              </section> : null }

            </article>
            
          ))}
      </div>
    </>
  );
}
export default Discussion;