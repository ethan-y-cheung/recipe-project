import { useState } from 'react'
import '../styles/Recipes.css'

// mock data
import { recipes } from './recipes'

// icons
import { Bookmark } from 'lucide-react';

// Overall: make a type -> union of all constant strings
  // without as const -> typeof returns String[], [number] returns String

// makes value of the array pointed as literals and made readonly (not string)
const FILTER_OPTIONS = ['All Recipes', 'Official Only', 'User-Generated'] as const
type RecipeFilter = (typeof FILTER_OPTIONS)[number]
// indexing by "number" -> indexes every index (instead of 0, 1, etc...) -> returns union of element types
// RecipeFilter = 'All Recipes' | 'Official Only' | 'User-Generated'

export default function Recipes() {

  // responsive, accessibility
  // tailwind

  // use color variables in common.css
  // BEM css class naming

  const [activeFilter, setActiveFilter] = useState<RecipeFilter>('All Recipes')

  return (
    <main className="recipes-page-main">
      <header className="recipes-heading">
        <div className="recipes-heading__text">
          <h2 className="recipes-heading__title">Explore <span className="recipe-heading__title--red">Recipes</span></h2>
          <p className="recipes-heading__subtitle">
            Find your next favorite meal from our growing recipe collection.
          </p>
        </div>
        <div className="recipes-heading__image-mask">
          <img
            className="recipes-heading__image"
            src="https://media-cldnry.s-nbcnews.com/image/upload/t_social_share_1200x630_center,f_auto,q_auto:best/newscms/2024_28/2067113/keep-it-zesty-chicken-shawarma-2x1-mc-240712.jpg"
            alt="An assortment of dishes spread across a table"
          />
        </div>
      </header>

      <h2 className="recipe-catalog-text">Recipe Catalog</h2>

      {/* if time: add sliding button */}
      <div className="recipe-filter" role="group" aria-label="Filter recipes">
        {FILTER_OPTIONS.map((option) => (
          <button
            key={option}
            type="button"
            className={`recipe-filter__option ${option === activeFilter ? 'recipe-filter__option--active':''}`}
            aria-pressed={option === activeFilter} //indicates if pressed or not to screen readers...
            onClick={() => setActiveFilter(option)}
          >
            {option}
          </button>
        ))}
      </div>

      
      {/* search bar, filter multiselect shadcn, pagination shadcn, card -> toggle shadcn */}
      <section className="recipe-catalog">
        {recipes.map(recipeData => (
          <div id={recipeData.id}>
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
                  {/* <Bookmark /> */}
                  <svg className={`recipe-card__save-button-icon${recipeData.saved ? ' recipe-card__save-button-icon--active':''}`} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2 2 0 0 1 2 2v15a1 1 0 0 1-1.496.868l-4.512-2.578a2 2 0 0 0-1.984 0l-4.512 2.578A1 1 0 0 1 5 20V5a2 2 0 0 1 2-2z"/></svg>
                </button>

              </div>
              <section className="recipe-card__tag-row">
                <div className="recipe-card-tag">
                  {/* star/ratings icon */}
                  <svg className="recipe-card-tag__star-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/></svg>
                  <p className="recipe-card-tag__text">{recipeData.averageRating}</p>
                </div>
                {recipeData.tags.slice(0, 1).map(tag => (
                  <div className="recipe-card-tag">
                    <p className="recipe-card-tag__text">{tag}</p>
                  </div>
                ))}
              </section>
            </article>
          </div>
        ))}
      </section>
    </main>
  )
}
