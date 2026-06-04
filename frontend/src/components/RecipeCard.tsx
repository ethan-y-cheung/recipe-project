import './RecipeCard.css'

import type { Recipe, Rating } from '../../../shared/types/index.ts'
import { BookmarkIcon, StarIcon } from './IconExports.tsx';

const RecipeCard = ({ recipeData, isSaved, onSave }: { recipeData: Recipe, isSaved: boolean, onSave: (recipeId: string, currentlySaved: boolean) => Promise<void> }) => {
  const ratingsArray : Rating[] = recipeData.rating || [];
  let avgRating : number;

  if (ratingsArray.length > 0) {
    const total : number = ratingsArray.reduce((score, r) => score + (r.value ?? 0), 0);
    avgRating = (total / ratingsArray.length);
  } else {
    avgRating = 0;
  }

  const handleToggleSaved = async () => {
    await onSave(recipeData.id, isSaved);
  }

  return (
    <article className="recipe-card-original">
      <div className="recipe-card__image-mask">
        {<img className="recipe-card__image" src={recipeData.images ? recipeData.images[0] : ''} />}
      </div>
      <div className="recipe-card__top-row">

        <div className="recipe-card__text-wrapper">
          <h3 className="recipe-card__recipe-name">{recipeData.title}</h3>
          <p className="recipe-card__author-name">{recipeData.creator_ID}</p>
        </div>

        <button className={`recipe-card__save-button${isSaved ? ' recipe-card__save-button--active':''}`}
          onClick={handleToggleSaved}>
          {/* Save icon */}
          <BookmarkIcon className={`recipe-card__save-button-icon${isSaved ? ' recipe-card__save-button-icon--active':''}`} />
        </button>

      </div>
      <section className="recipe-card__tag-row">
        <div className="recipe-card-tag">
          {/* Star/ratings icon */}
          <StarIcon className={"recipe-card-tag__star-icon"}/> 
          <p className="recipe-card-tag__text">{recipeData.rating.length > 0 ? avgRating : 'New'}</p>
        </div>
        {/* for testing... user generated vs. official */}
        {!recipeData.user_generated && <div className="recipe-card-tag recipe-card-tag--official">
           <p className="recipe-card-tag__text">Official</p>
        </div>}
        {recipeData.tags.slice(0, 1).map(tag => (
          <div key={tag.name} className="recipe-card-tag">
            <p className="recipe-card-tag__text">{tag.name}</p>
          </div>
        ))}
      </section>
    </article>
  )
}

export default RecipeCard;
