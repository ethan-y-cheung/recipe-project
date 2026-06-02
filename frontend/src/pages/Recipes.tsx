import { useState } from 'react'
import '../styles/Recipes.css'

import RecipeCard from '../components/RecipeCard';

// mock data
import { recipes } from './recipes'


// Overall: make a type -> union of all constant strings
  // without as const -> typeof returns String[], [number] returns String

// makes value of the array pointed as literals and made readonly (not string)
const FILTER_OPTIONS = ['All Recipes', 'Official Only', 'User-Generated'] as const
type RecipeFilter = (typeof FILTER_OPTIONS)[number]
// indexing by "number" -> indexes every index (instead of 0, 1, etc...) -> returns union of element types
// RecipeFilter = 'All Recipes' | 'Official Only' | 'User-Generated'

export default function Recipes() {

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

      
      {/* search bar */}
      {/* filter */}
      {/* pagination */}
      <section className="recipe-catalog">
        {recipes.map(recipeData => (
          <div id={recipeData.id}>
            <RecipeCard recipeData={recipeData}/>
          </div>
        ))}
      </section>

    </main>
  )
}
