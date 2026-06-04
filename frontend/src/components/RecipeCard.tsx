import './RecipeCard.css'

import type { Recipe, Rating } from '../../../shared/types/index.ts'

const RecipeCard = ({ recipeData, isSaved }: { recipeData: Recipe, isSaved: boolean }) => {
  const ratingsArray : Rating[] = recipeData.rating || [];
  let avgRating : number;

  if (ratingsArray.length > 0) {
    const total : number = ratingsArray.reduce((score, r) => score + (r.value ?? 0), 0);
    avgRating = (total / ratingsArray.length);
  } else {
    avgRating = 0;
  }

  return (
    <article className="recipe-card">
      <div className="recipe-card__image-mask">
        {recipeData.images[0] && <img className="recipe-card__image" src={recipeData.images[0]} />}
      </div>
      <div className="recipe-card__top-row">

        <div className="recipe-card__text-wrapper">
          <h3 className="recipe-card__recipe-name">{recipeData.title}</h3>
          <p className="recipe-card__author-name">{recipeData.creator_ID}</p>
        </div>

        <button className={`recipe-card__save-button${isSaved ? ' recipe-card__save-button--active':''}`}>
          {/* <Bookmark /> */}
          <svg className={`recipe-card__save-button-icon${isSaved ? ' recipe-card__save-button-icon--active':''}`} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2 2 0 0 1 2 2v15a1 1 0 0 1-1.496.868l-4.512-2.578a2 2 0 0 0-1.984 0l-4.512 2.578A1 1 0 0 1 5 20V5a2 2 0 0 1 2-2z"/></svg>
        </button>

      </div>
      <section className="recipe-card__tag-row">
        <div className="recipe-card-tag">
          {/* star/ratings icon */}
          <svg className="recipe-card-tag__star-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/></svg>
          <p className="recipe-card-tag__text">{avgRating}</p>
        </div>
        {recipeData.tags.slice(0, 1).map(tag => (
          <div className="recipe-card-tag">
            <p className="recipe-card-tag__text">{tag.name}</p>
          </div>
        ))}
      </section>
    </article>
  )
}

export default RecipeCard;
