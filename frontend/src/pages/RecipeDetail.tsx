// import { useParams } from 'react-router-dom'
import { Star, Bookmark, MessageCircle} from 'lucide-react';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import type { Recipe, Comments, User, Rating } from "../../../shared/types/index.ts";
import Chatbot from '../components/Chatbot.tsx';
import CommentForm from '../components/CommentForm.tsx';
import Discussion from '../components/Discussion.tsx';
import "../styles/RecipeDetail.css";

const recipe: Recipe = {
  recipe_ID: "123",
  user_generated: false,
  creator_ID: "Allison",
  title : "ramen",
  created_at: new Date(),
  tags: [{name: "quick", type: "difficulty"}],
  ingredients: [
    {name: "ramen", quantity: "one package"}, 
    {name: "water", quantity: "2 cups"},
    {name: "salt", quantity: "1 teaspoon"},
    {name: "siracha", quantity: "1 lb"}],
  instructions: ["cook ramen", "eat ramen", "clean kitchen"],
  images: [ "https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=800&auto=format&fit=crop&q=60"],
  servings: 1,
  total_time: "20 minutes",
  rating: [{user_ID: "Kaitlyn", value: 5}, {user_ID: "Leo", value: 2}]
};

const user: User = {
  username: "example",
  password: "password123",
  admin: false,
  my_recipes: [],
  saved_recipes: [],
}

const comments: Comments[] = [
    {recipe_ID: "123",
    id: "111",
    creator_ID: "Lucinda",
    content: "needs butter",
    likes: [], //array of user_IDs who liked the comment
    created_at: new Date(2026, 6, 1),
    replies: []},
    {recipe_ID: "123",
      id: "333",
    creator_ID: "Michael",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam facilisis, nunc sed feugiat euismod, mi ante pulvinar velit, facilisis commodo massa massa egestas nulla. Donec id leo sed turpis mollis malesuada. Phasellus posuere semper molestie. Praesent quis tincidunt nisl. Duis fringilla metus risus, ac tempor nunc dignissim a. Nulla vitae ornare ligula. Morbi facilisis facilisis nulla, in rutrum odio maximus at.",
    likes: ["rachel"], //array of user_IDs who liked the comment
    created_at: new Date(2024, 1, 1),
    replies: [
       {recipe_ID: "123",
        id: "222",
      creator_ID: "Lucinda",
      content: "needs butter",
      likes: [], //array of user_IDs who liked the comment
      created_at: new Date(2026, 6, 1),
      replies: []}
    ]}
]

export default function RecipeDetail() {
  // used later when pulling data from firebase
  // const { recipeId } = useParams<{recipeId: string}>();

  const [done, setDone] = useState<boolean[] | null>(new Array(recipe.ingredients.length).fill(false));
  const [bookmarked, setBookmarked] = useState<boolean>(false); // idk how to do this :(
  

  const [avgRating, setAverageRating] = useState<number>(recipe.rating.length > 0 
  ? recipe.rating.reduce((score, rating) => score + (rating.value ?? 0), 0) / recipe.rating.length 
  : 0);
  
  const [showChat, setShowChat] = useState<boolean>(false);
  const [rating, setRating] = useState<null | 1 | 2 | 3 | 4 | 5>(null);

  const handleRating = (userRating : 1 | 2 | 3 | 4 | 5) => {
    setRating(userRating);
    let newRatings: Rating[];

    // if you have already rated it, remove that value
    if (recipe.rating.some(rating => rating.user_ID === user.username)) {
      newRatings = recipe.rating.filter(rating => rating.user_ID !== user.username);
    // otherwise add in the new rating
    } else {
      newRatings = [...recipe.rating, {user_ID: user.username, value: userRating}]; 
    }
   
    setAverageRating(newRatings.length > 0 
    ? newRatings.reduce((score, rating) => score + (rating.value ?? 0), 0) / newRatings.length 
    : 0)
  }

  return (
    <>
      <article className="detail-page-content">
        <header className="recipe-header">
          <section className="recipe-header-info">
            <div className="recipe-header-row">
              <h1>{recipe.title}</h1>
              <div className="star-container">
                <Star fill={avgRating >= 1 ? "#FFDF00" : "transparent"} className="header-icon"/>
                <Star fill={avgRating >= 2 ? "#FFDF00" : "transparent"} className="header-icon"/>
                <Star fill={avgRating >= 3 ? "#FFDF00" : "transparent"} className="header-icon"/>
                <Star fill={avgRating >= 4 ? "#FFDF00" : "transparent"} className="header-icon"/>
                <Star fill={avgRating >= 5 ? "#FFDF00" : "transparent"} className="header-icon"/>
              </div>
            </div>

            <div className="recipe-header-row">
              <p>author: {recipe.creator_ID ? recipe.creator_ID : "Unknown"}</p>
              <p>created: {recipe.created_at ? formatDistanceToNow(recipe.created_at, { addSuffix: true }) : "Unknown"}</p>
            </div>
            
            <div className="recipe-header-row">
              <Bookmark fill={bookmarked ? "#FFDF00" : "transparent"} className="header-icon" onClick={() => setBookmarked(prevState => !prevState)}/> 
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
              src={recipe.images[0]}
              alt={recipe.title}
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
                  <li className="step" key={index}>{step}</li>
                ))}
              </ol>
            </section>

            {/* Discussion Section */}
            <Discussion username={user.username} comments={comments}/>

            <h2 className="section-title">Leave Feedback </h2>
            <section className="feedback-container">
                {/* rate and leave a comment */}
              <div className="rating-container">
                <h2>Rating</h2> 
                <div className="star-container">
                  <Star fill={rating ?? 0 >= 1 ? "#FFDF00" : "transparent"} onClick={() => handleRating(1)} className="header-icon"/>
                  <Star fill={rating ?? 0 >= 2 ? "#FFDF00" : "transparent"} onClick={() => handleRating(2)} className="header-icon"/>
                  <Star fill={rating ?? 0 >= 3 ? "#FFDF00" : "transparent"} onClick={() => handleRating(3)} className="header-icon"/>
                  <Star fill={rating ?? 0 >= 4 ? "#FFDF00" : "transparent"} onClick={() => handleRating(4)} className="header-icon"/>
                  <Star fill={rating ?? 0 >= 5 ? "#FFDF00" : "transparent"} onClick={() => handleRating(5)} className="header-icon"/>
                </div>
              </div>
              <CommentForm username={user.username}/>
            </section>
          </div>
      
          {/* similar recipe section */}
          <aside className="recipe-sidebar">
            <h2 className="section-title">Similar Recipes</h2>
            <div className="similar-recipe-container">
              {/* Insert similar cards here */}
              
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
