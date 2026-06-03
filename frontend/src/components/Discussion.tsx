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

// mock api
const api = {
  toggleLike: async (): Promise<{ success: boolean }> => {
    // Mimic network latency
    await new Promise((resolve) => setTimeout(resolve, 600));
    if (Math.random() < 0.05) throw new Error('Network error'); // 5% failure chance
    return { success: true };
  }
}


const Discussion = ( {username, comments} : DiscussionProps) => {
  const [openReply, setOpenReply] = useState<string>("");
  const [isMutating, setIsMutating] = useState<boolean>(false);
  const [allPosts, setAllPosts] = useState<Comments[]>(comments);

  const handleLike = async (comment : Comments) => {
    if (isMutating) return; // no double clicking
    setIsMutating(true);

    const prevComment : Comments = comment;
    const newLikes : string[] = comment.likes.includes(username) ? comment.likes.filter(user => user !== username) : [...comment.likes, username];

    const newPost : Comments = prevComment;
    prevComment.likes = newLikes;

    // update posts on the page

    const updatedPosts : Comments[] = allPosts.map(post => post.id === prevComment.id ? newPost : post); // either remove or add user id for liking the post
    setAllPosts([...updatedPosts]);

    try {
      // mocked update database
      await api.toggleLike();
    } catch (error) {
      // 4. Roll back to previous state if API fails
      console.error(`Failed to like post:`, error);
      const updatedPosts : Comments[] = allPosts.map(post => post.id === prevComment.id ? prevComment : post); // either remove or add user id for liking the post
      setAllPosts(updatedPosts);
    } finally {
      setIsMutating(false);
    }
  };

  

  const options: FilterOption[] = [
    { label: "Most Likes", value: "likes" },
    { label: "Most Recent", value: "created_at" }
  ];

  // default filtering is by popularity
  const [filter, setFilter] = useState<FilterValue>("likes");


  const handleFiltering = (newFilter: FilterValue) => {
    setFilter(newFilter);
  }

  const sortedComments = allPosts.toSorted((a, b) => {
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

  const handleReply = (id : string) => {
    setOpenReply(id);
    console.log(id);
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
                  <ThumbsUp onClick={() => handleLike(comment)} className="icon-button"/>
                  <button onClick={() => handleReply(comment.id)} className="reply-button"> <Reply/>reply </button>
                </div>
              </div>
              
            
              <section className="replies">
                {openReply === comment.id ? 
                <div className="reply-container">
                  <strong>{username}</strong>
                  <textarea 
                    placeholder="message..."
                    className="reply-text">
                  </textarea> 

                  <div className="star-container">
                    <button onClick={() => setOpenReply("")} className="cancel-button">Cancel</button>
                    <button className="reply-button">Submit</button>
                  </div>
                  
                </div> : null }

                {comment.replies.map(reply => (
                <div key={reply.id} className="comment">
                  <p style={{color: "black"}}><strong>{reply.creator_ID}</strong></p>
                  <p>{formatDistanceToNow(reply.created_at, { addSuffix: true })}</p>
                  <p className="comment-content">{reply.content}</p>
                  <div className="comment-footer"> 
                    <p>{reply.likes.length}</p>
                    <ThumbsUp onClick={() => handleLike(reply)} className="icon-button" />
                    <button className="reply-button"> <Reply/>reply </button>
                  </div>
                </div>))}
              </section> 

            </article>
            
          ))}
      </div>
    </>
  );
}
export default Discussion;