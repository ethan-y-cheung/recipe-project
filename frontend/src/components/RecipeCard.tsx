import './RecipeCard.css'

import type { RecipeType } from '../pages/recipeData'
import { BookmarkIcon, StarIcon } from './IconExports'

const RecipeCard = ({ recipeData }: { recipeData: RecipeType }) => {
  return (
    <article className="recipe-card">
      <div className="recipe-card__image-mask">
        {recipeData.recipeImage && <img className="recipe-card__image" src={recipeData.recipeImage} />}
      </div>
      <div className="recipe-card__top-row">

        <div className="recipe-card__text-wrapper">
          <h3 className="recipe-card__recipe-name">{recipeData.recipeName}</h3>
          <p className="recipe-card__author-name">{recipeData.authorName}</p>
        </div>

        <button className={`recipe-card__save-button${recipeData.saved ? ' recipe-card__save-button--active':''}`}>
          <BookmarkIcon className={`recipe-card__save-button-icon${recipeData.saved ? ' recipe-card__save-button-icon--active':''}`} />
        </button>

      </div>
      <section className="recipe-card__tag-row">
        <div className="recipe-card-tag">
          <StarIcon className="recipe-card-tag__star-icon" />
          <p className="recipe-card-tag__text">{recipeData.averageRating}</p>
        </div>
        {recipeData.tags.slice(0, 1).map(tag => (
          // todo: use tag doc id instead
          <div key={tag} className="recipe-card-tag">
            <p className="recipe-card-tag__text">{tag}</p>
          </div>
        ))}
      </section>
    </article>
  )
}

export default RecipeCard;
