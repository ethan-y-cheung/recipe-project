import { useParams } from 'react-router-dom'
import { Star, Bookmark, MessageCircle} from 'lucide-react';
import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import type { Recipe, Comments, Rating, UserRecipeNotes } from "../../../shared/types/index.ts";
import Chatbot from '../components/RecipeDetail/Chatbot.tsx';
import CommentForm from '../components/RecipeDetail/CommentForm.tsx';
import Discussion from '../components/RecipeDetail/Discussion.tsx';
import { useAuth } from '@/contexts/AuthContext.tsx';
// import RecipeCard from '@/components/RecipeCard.tsx';

import axios from 'axios';
import "../styles/RecipeDetail.css";

const BASE_URL = import.meta.env.VITE_API_URL;

export default function RecipeDetail() {
  // used later when pulling data from firebase
  const { recipeId } = useParams<{recipeId: string}>();
  const [allPosts, setAllPosts] = useState<Comments[]>([]);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [done, setDone] = useState<boolean[] | null>(null);
  const [bookmarked, setBookmarked] = useState<boolean>(false); 
  const [avgRating, setAverageRating] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [showChat, setShowChat] = useState<boolean>(false);
  // pull old rating if it exists
  const [rating, setRating] = useState<null | 1 | 2 | 3 | 4 | 5>(null);
  const { currentUser, userData, refreshUser } = useAuth();

  // grab a temporary viewing url for user uploaded images
  const viewPhoto = async (fileKey : string) => {
    try {
      const { data } = await axios.post(`${BASE_URL}/aws/get-view-url`, { fileKey });
      console.log(data.viewUrl);
      return data.viewUrl;
    } catch (error) {
      console.error("Error loading image from S3:", error);
    }
  }

  // fetch recipe data
  useEffect(() => {
    const fetchRecipeData = async() => {
      setIsLoading(true);
      try {
        // database or api call here
        const { data } = await axios.get(`${BASE_URL}/recipes/single/${recipeId}`);
        // data.created_at = new Date(data.created_at.seconds * 1000)
        data.created_at = new Date();
        setRecipe(data);

        // requires aws calls
        if (data.user_generated) {
          // grabs viewing urls for recipe images
          // Creates an array of promises by marking the map callback as async
          const imagePromises = data.images.map(async (fileKey : string) => {
            if (fileKey) {
              return await viewPhoto(fileKey); // Added 'await'
            } else {
              return null;
            }
          });
          data.imageUrls = await Promise.all(imagePromises);
        } else {
          data.imageUrls = data.images;
        }

        const response = await axios.get(`${BASE_URL}/comments`, {
          params: { recipe_ID: data.id},
        });
        setAllPosts(response.data);
        setDone(new Array(data.ingredients.length).fill(false));
        
        // determine average rating
        const ratingsArray = data.rating || [];
        if (ratingsArray.length > 0) {
          const total = ratingsArray.reduce((score : number, r : Rating) => score + (r.value ?? 0), 0);
          setAverageRating(total / ratingsArray.length);
        } else {
          setAverageRating(0);
        }

        // determine if the user rated this recipe previously
        if (userData) {
          const userRating = ratingsArray.find((r : Rating)=> r.user_ID === userData.username);
          setRating(userRating?.value ?? null);

          // determine if this recipe is saved
          setBookmarked(userData.saved_recipes.some(recipe => recipe.recipe_id === data.id))
        } else {
          setRating(null);
        }

      } catch (error) {
        console.error("unable to fetch recipe data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchRecipeData();
  }, [recipeId, userData])

  const handleComment = async (newComment:Comments, parent_id : string) => {
    // no commenting if not logged in
    if (!currentUser) return;

    try {
      const token = await currentUser?.getIdToken();
      const response = await axios.post(
        `${BASE_URL}/comments`, 
        { 
          comment: newComment, // This is the request body (req.body)
          parent_id: parent_id
        }, 
        { 
          headers: { 
            Authorization: `Bearer ${token}`, // This is now correctly sent as a header
          }, 
        }
      );
      const newCommentId = response.data.id;
      newComment.id = newCommentId;

      // use new comment id / comment object from backend
      if (parent_id === "") {
        setAllPosts([...allPosts, newComment]);
      } else {
        setAllPosts([...allPosts.map(post => post.id === parent_id ? 
        {...post, reply_IDs:[...post.reply_IDs, newComment.id], replies:[...post.replies, newComment]} 
        : post)])
      }

    } catch (error) {
      console.error("error posting comment: ", error);
    }
  }

  const handleDelete = async (comment : Comments | null, parent_id: string) => {
    if (!comment) return;
    try {
      const token = await currentUser?.getIdToken();
      // delete comments
      await axios.post(
        `${BASE_URL}/comments/delete`, 
        { 
          comment: comment, // This is the request body (req.body)
          parent_id: parent_id,
        }, 
        { 
          headers: { 
            Authorization: `Bearer ${token}`, 
          }, 
        }
      );

      const newPosts : Comments[] = allPosts.filter((post) => post.id !== comment.id)

      setAllPosts([
        ...newPosts.map(post => ({
          ...post, 
          replies: post.replies.filter(reply => reply.id !== comment.id)
        }))
      ]);

    } catch (error) {
      console.error("error deleting comment: ", error);
    }
  }

  const handleBookmark = async() => {
    // not logged in == no bookmarking
    if (!userData || !currentUser) return;
    setBookmarked(prevState => !prevState); // optimistic update

    try {
      const token = await currentUser.getIdToken();
      let newSaved : UserRecipeNotes[] = [];
      if (bookmarked) {
        newSaved = [...userData.saved_recipes.filter(saved => saved.recipe_id !== recipe?.id)]
      } else {
        newSaved = [...userData.saved_recipes, {recipe_id: recipe?.id || "", notes: "", user_tags: []}];
      }
      const updatedBodyData = {
        ...userData,
        saved_recipes: newSaved
      };

      const res = await axios.put(
        `${BASE_URL}/users/me`, 
        updatedBodyData, // Data payload
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      return res.data;
    } catch (error) {
      setBookmarked(prevState => !prevState);
      console.error("Unable to update user information:", error);
      return null;
    }
  }

  const updateComment = async (comment : Comments) => {
    try {
      const token = await currentUser?.getIdToken();
      // update comment
      await axios.put(
        `${BASE_URL}/comments`, 
        { 
          comment: comment, 
        }, 
        { 
          headers: { 
            Authorization: `Bearer ${token}`, 
          }, 
        }
      );

    } catch (error) {
      console.error("error updating comment: ", error);
    }
  }

  const handleRating = async (userRating : 1 | 2 | 3 | 4 | 5) => {
    if (!userData || !currentUser) return;
    setRating(userRating);
    let newRatings: Rating[];

    // if you have already rated it, remove that value
    if (recipe?.rating.some(rating => rating.user_ID === userData.username)) {
      newRatings = recipe.rating.filter(rating => rating.user_ID !== userData.username);
    // otherwise add in the new rating
    } else {
      newRatings = recipe ? [...recipe.rating, {user_ID: userData.username, value: userRating}] : []; 
    }
    
    // update average rating
    setAverageRating(newRatings.length > 0 
    ? newRatings.reduce((score, rating) => score + (rating.value ?? 0), 0) / newRatings.length 
    : 0)


    const updatedRecipePayload = {...recipe,rating: newRatings,};

    try {
      const token = await currentUser?.getIdToken();
      // make endpoint request
      await axios.put(
          `${BASE_URL}/recipes`, 
          { 
            recipe: updatedRecipePayload, // This is the request body (req.body)
          }, 
          { 
            headers: { 
              Authorization: `Bearer ${token}`, 
            }, 
          }
        );
    } catch (error) {
      console.error("unable to process rating: ", error);
    }
  }

  if (isLoading) {
    return (<div>Loading data...</div>);
  }

  // guard clause
  if (!recipe) {
    return <></>;
  }


  return (
    <>
      <article className="detail-page-content">
        <header className="recipe-header">
          <section className="recipe-header-info">
            <div className="detail-header-row">
              <h1 className="detail-title">{recipe.title}</h1>
              <div className="star-container">
                <Star fill={avgRating >= 1 ? "#FFDF00" : "transparent"} className="header-icon"/>
                <Star fill={avgRating >= 2 ? "#FFDF00" : "transparent"} className="header-icon"/>
                <Star fill={avgRating >= 3 ? "#FFDF00" : "transparent"} className="header-icon"/>
                <Star fill={avgRating >= 4 ? "#FFDF00" : "transparent"} className="header-icon"/>
                <Star fill={avgRating >= 5 ? "#FFDF00" : "transparent"} className="header-icon"/>
              </div>
            </div>

            <div className="detail-header-row">
              <p>author: {recipe.creator_ID ? recipe.creator_ID : "Unknown"}</p>
              <p>created: {recipe.created_at ? formatDistanceToNow(recipe.created_at, { addSuffix: true }) : "Unknown"}</p>
            </div>
            
            <div className="detail-header-row">
              <Bookmark fill={bookmarked ? "#FFDF00" : "transparent"} className="header-icon" onClick={() => handleBookmark()}/> 
              <div className="star-container">
                {recipe.tags.map((tag, index) => (
                  <div key={index} className="tag"> {`${tag.type} : ${tag.name}`}</div>
                ))}
              </div>
            </div>

            {/* <div className="recipe-header-row"> */}
              <span className="additional-info">Servings: {recipe.servings??"unknown"}</span>
              <span className="additional-info">Total time: {recipe.total_time??"unknown"}</span>
            {/* </div> */}
          </section>

          <img
              className="header-image"
              src={recipe.imageUrls?.[0] ?? undefined}
              alt={`image of ${recipe.title}`}
          />
        </header>
          
        <section className="detail-page">

          <div className="scroll-info">
            {/* Ingredients / Ingredients section */}
            <section className="grid-square">
              <h2 className="section-title">Ingredients</h2>
              <div className="ingredients-container">
                {recipe.ingredients.map((ingredient, index) => (
                  <label 
                  key={index}
                  className={`ingredient ${(done ? done[index] : false ) ? "crossed-out": ""}`}>
                    <input
                      type="checkbox"
                      // trying to import this as a classname somehow doesn't change the checkbox size
                      style={{width:"1rem", height:"1rem"}}
                      checked={(done ? done[index] : false )} 
                      onChange={() => {
                        const newDone = [...done ?? []];
                        newDone[index] = done ? !done[index] : false; // flip state, provide default for null array
                        setDone(newDone);
                      }} 
                    />
                    <span>{ingredient.name} - {ingredient.quantity} </span>
                  </label>
                ))}
              </div>

              {/* instructions section */}
              <h2 className="section-title">Instructions</h2>
              <ol className="ingredients-container">
                {recipe.instructions.map((step, index) => (
                  <li className="step" key={index}>
                    {step}
                    {recipe.imageUrls?.[index+1]? 
                    <div className="step-image-container">
                      <img className="step-image" src={recipe.imageUrls?.[index+1]??""}  alt={"instruction image"}/>
                    </div> : null}
                  </li>
                ))}
              </ol>
            </section>

            <h2 className="section-title">Leave Feedback </h2>
            <section className="feedback-container">
                {/* rate and leave a comment */}
              <div className="rating-container">
                <h2>Rating</h2> 
                <div className="star-container">
                  <Star fill={(rating ? rating : 0) >= 1 ? "#FFDF00" : "transparent"} onClick={() => handleRating(1)} className="header-icon"/>
                  <Star fill={(rating ? rating : 0) >= 2 ? "#FFDF00" : "transparent"} onClick={() => handleRating(2)} className="header-icon"/>
                  <Star fill={(rating ? rating : 0) >= 3 ? "#FFDF00" : "transparent"} onClick={() => handleRating(3)} className="header-icon"/>
                  <Star fill={(rating ? rating : 0) >= 4 ? "#FFDF00" : "transparent"} onClick={() => handleRating(4)} className="header-icon"/>
                  <Star fill={(rating ? rating : 0) >= 5 ? "#FFDF00" : "transparent"} onClick={() => handleRating(5)} className="header-icon"/>
                </div>
              </div>
              <CommentForm recipe_ID={recipe.id} username={userData?.username??""} createComment={handleComment}/>
            </section>

            {/* Discussion Section */}
            <Discussion updateComment={updateComment} createComment={handleComment} handleDelete={handleDelete} recipe_ID = {recipe.id} username={userData?.username??""} comments={allPosts}/>
          </div>
      
          {/* similar recipe section */}
          <aside className="recipe-sidebar">
            <h2 className="section-title">Similar Recipes</h2>
            <div className="similar-recipe-container">
              {/* Insert similar cards here */}
              {/* <RecipeCard recipeData={recipe} isSaved={true} avgRating={3}/>
              <RecipeCard recipeData={recipe} isSaved={true} avgRating={3}/>
              <RecipeCard recipeData={recipe} isSaved={true} avgRating={3}/>
              <RecipeCard recipeData={recipe} isSaved={true} avgRating={3}/> */}
            </div>
          </aside>
          
        </section>
      </article>

      <button 
      className="ai-button"
      onClick={() => setShowChat(prevState=>!prevState)}
      >
        <MessageCircle />
        Let's chat!
      </button>

      {showChat ? <Chatbot setClose={setShowChat}/> : null }
    </>
  )
}
