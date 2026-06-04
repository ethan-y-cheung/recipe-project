import "../../styles/RecipeDetail.css";
import { ThumbsUp, Reply, Trash, SquarePen } from 'lucide-react';
import type { Comments } from '../../../../shared/types/index.ts';
import {formatDistanceToNow} from 'date-fns';
import { useState, useEffect } from 'react';
import ConfirmDelete from "./ConfirmDelete.tsx";

interface DiscussionProps {
  username: string;
  recipe_ID: string;
  comments: Comments[];
  handleDelete: (comment : Comments | null, parent_id: string) => void;
  createComment: (newComment : Comments, parent_id: string) => void;
  updateComment: (newComment : Comments) => void;
}

type FilterValue = 'likes' | 'created_at';

interface FilterOption {
  value: FilterValue;
  label: string;
}


const Discussion = ( {createComment, handleDelete, updateComment, recipe_ID, username, comments} : DiscussionProps) => {
  const [openReply, setOpenReply] = useState<string>("");
  const [isMutating, setIsMutating] = useState<boolean>(false);
  const [allPosts, setAllPosts] = useState<Comments[]>(comments);
  const [replyError, setReplyError] = useState<boolean>(false);
  const [replyText, setReplyText] = useState<string>("");
  const [openConfirmation, setOpenConfirmation] = useState<boolean>(false);
  const [currentComment, setCurrentComment] = useState<Comments>();
  const [parentId, setParentId] = useState<string>("");

  useEffect(() => {
    const updatePosts = () => {
      setAllPosts(comments);
    }
    updatePosts();
  }, [comments]); // handles updates caused by submitting a new comment form in the detail page


  const handleLike = async (comment : Comments) => {
    // no liking comments if you're not logged in
    if (username === "") return; 
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
      updateComment(newPost);
    } catch (error) {
      // undo change if db call fails
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

  const handleOpenReply = (id : string) => {
    if (openReply !== "") {
      setOpenReply("");
    } else {
      setOpenReply(id);
    }
  }

  const handleReply = async (originalPost: Comments, replyContent : string) => {
    setReplyError(replyContent === "");
    if (replyContent === "") return;
    
    // create a reply object
    const reply : Comments = {creator_ID: username, recipe_ID: recipe_ID, id: "", content: replyContent, likes: [], created_at: new Date(), replies: [], reply_IDs: [] };

    try {
      // database interaction, optimistic ui update in RecipeDetail.tsx
      await createComment(reply, originalPost.id);

    } catch (error) {
      console.error(`Failed to reply to post:`, error);
    } finally {
      setOpenReply("");
      setReplyText("");
    } 
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
        onChange={(e) => setFilter(e.target.value as FilterValue)}
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
                  <ThumbsUp 
                  fill={(username !== "" ? comment.likes.includes(username) : false) ? 'rgb(189, 189, 189)' : "transparent"}
                  onClick={() => handleLike(comment)} className="icon-button"/>
                  <button onClick={() => handleOpenReply(comment.id)} className="reply-button"> <Reply/>reply </button>

                   {username === comment.creator_ID ? 
                    <>
                      <SquarePen className="icon-button"/>
                      <Trash onClick={() => {setParentId("") ; setCurrentComment(comment) ; setOpenConfirmation(prevState=>!prevState)}} className="icon-button"/>
                    </> : null }
                  
                </div>
              </div>
              
            
              <section className="replies">
                {openReply === comment.id ? 
                <div className="reply-container">
                  <strong>{username}</strong>
                  <textarea 
                    placeholder="message..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className={`reply-text ${replyError ? "error" : ""}`}>
                  </textarea> 

                  <div className="star-container">
                    <button onClick={() => setOpenReply("")} className="cancel-button">Cancel</button>
                    <button onClick={() => handleReply(comment, replyText)} className="reply-button">Submit</button>
                  </div>
                  
                </div> : null }

                {comment.replies.map(reply => (
                <div key={reply.id} className="comment">
                  <p style={{color: "black"}}><strong>{reply.creator_ID}</strong></p>
                  <p>{formatDistanceToNow(reply.created_at, { addSuffix: true })}</p>
                  <p className="comment-content">{reply.content}</p>
                  <div className="comment-footer"> 
                    <p>{reply.likes.length}</p>
                    <ThumbsUp 
                    fill={(username !== "" ? reply.likes.includes(username) : false) ? 'rgb(189, 189, 189)' : "transparent"}
                    onClick={() => handleLike(reply)} className="icon-button" />
                    <button className="reply-button"> <Reply/>reply </button>
                    {username === reply.creator_ID ? 
                    <>
                      <SquarePen className="icon-button"/>
                      <Trash onClick={() => {setParentId(comment.id) ; setCurrentComment(reply) ; setOpenConfirmation(prevState=>!prevState)}} className="icon-button"/>
                    </> : null }
                  </div>
                </div>))}
              </section> 

            </article>
            
          ))}
      </div>
      {openConfirmation ? <ConfirmDelete comment={currentComment??null} confirmDelete={handleDelete} closeForm={setOpenConfirmation} parent_id={parentId}/> : null}
    </>
  );
}
export default Discussion;