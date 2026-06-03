import "../styles/RecipeDetail.css";
import { ThumbsUp, Reply } from 'lucide-react';
import type { Comments } from "../../../shared/types/index.ts";
import {formatDistanceToNow} from 'date-fns';
import { useState } from 'react';

interface DiscussionProps {
  username: string;
  comments: Comments[];
}

type FilterValue = 'likes' | 'created_at';

interface FilterOption {
  value: FilterValue;
  label: string;
}


const Discussion = ( {comments} : DiscussionProps) => {
  // const [openReply, setOpenReply] = useState<boolean>(false);
  const options: FilterOption[] = [
    { label: "Most Likes", value: "likes" },
    { label: "Most Recent", value: "created_at" }
  ];

  // default filtering is by popularity
  const [filter, setFilter] = useState<FilterValue>("likes");


  const handleFiltering = (newFilter: FilterValue) => {
    setFilter(newFilter);
  }

  const sortedComments = comments.toSorted((a, b) => {
    if (filter === 'likes') {
      // Sort descending by total number of likes
      return b.likes.length - a.likes.length;
    }
    if (filter === 'created_at') {
      // Sort descending by date (most recent first)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
    return 0;
  });

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
        onChange={(e) => handleFiltering(e.target.value as FilterValue)}
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
          {sortedComments.map((comment, index) => (
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