import "../styles/RecipeDetail.css";
import { ThumbsUp, Reply } from 'lucide-react';
import type { Comments } from "../../../shared/types/index.ts";
import {formatDistanceToNow} from 'date-fns';
import { useState } from 'react';

interface DiscussionProps {
  username: string;
  comments: Comments[];
}

interface FilterOption {
  value: string;
  label: string;
}


const Discussion = ( {comments} : DiscussionProps) => {
  // const [openReply, setOpenReply] = useState<boolean>(false);
  const options : FilterOption[] = [{label: "most likes", value: "popularity"}, {label: "most recent", value: "timing"}]
  const [filter, setFilter] = useState<string> ("most likes");

  const handleFiltering = (newFilter : string) => {
    setFilter(newFilter);
  }

  return (
    <>
      <h2 className="section-title">Discussion</h2>

      {/* filtering */}
       <label className="filter-label" htmlFor="discussion-filter">
        filter comments
      </label>
      
      <select
        id="discussion-filter"
        className="discussion-filter"
        value={filter}
        onChange={(e) => handleFiltering(e.target.value)}
        style={{
          padding: '8px 12px',
          borderRadius: '4px',
          border: '1px solid #ccc',
          fontSize: '16px',
          backgroundColor: '#fff'
        }}
      >
        {/* Recommended placeholder / default state */}
        <option value="" disabled>
          -- Choose a filter --
        </option>
        
        {/* Map through the options array dynamically */}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

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