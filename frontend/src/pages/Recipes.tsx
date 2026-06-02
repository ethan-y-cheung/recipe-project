import { useState } from 'react'
import '../styles/Recipes.css'

import { Search } from 'lucide-react';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"

import {
  Combobox,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  ComboboxSeparator,
  ComboboxChips,
  ComboboxChip,
  ComboboxChipsInput,
  ComboboxValue,
  ComboboxTrigger,
  useComboboxAnchor
} from "@/components/ui/combobox"

import RecipeCard from '../components/RecipeCard';

// mock data... I'll use the mock data from backend endpoint (or actual API) instead next work period
// using the common ts type definitions
import recipes from './recipeData'

const FILTER_OPTIONS = ['All Recipes', 'Official Only', 'User-Generated'] as const
type RecipeFilter = (typeof FILTER_OPTIONS)[number]

export default function Recipes() {

  // Recipe type (all, official, user generated)
  const [activeFilter, setActiveFilter] = useState<RecipeFilter>('All Recipes');

  // Search query string.... todo will connect with
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [searchFilter, setSearchFilter] = useState("");


  // will fetch from backend instead once connected to firebase
  const recipeFilters = [
    {
      value: "Meal Type",
      items: [
        "Breakfast",
        "Lunch",
        "Dinner"
      ],
    },
    {
      value: "Dietary Restrictions",
      items: [
        "Vegetarian",
        "Vegan",
        "Gluten-free"
      ],
    }
  ] as const

  const anchor = useComboboxAnchor()

  return (
    <main className="recipes-page-main">

      {/* Header block */}
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

      {/* Page filter block */}
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


      {/* Search + filtering */}
      <div className="recipe-search-row">
        {/* Search bar */}
        <InputGroup className="recipe-search-row__search">
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupInput placeholder="Search..." />
        </InputGroup>

        {/* Tags dropdown filter      if time, limit to X tags */}
        <Combobox items={recipeFilters} multiple>

          {/* filter input trigger */}
          <ComboboxChips ref={anchor} className="recipe-search-row__combobox">
            <ComboboxValue>
              {(values) => (
                <>
                  {values.map((value: string) => (
                    <ComboboxChip key={value}>{value}</ComboboxChip>
                  ))}
                  <ComboboxChipsInput placeholder={values.length === 0 ? "Filters" : ""} />
                </>
              )}
            </ComboboxValue>
            <ComboboxTrigger className="recipe-search-row__combobox-trigger-icon" />
          </ComboboxChips>

          {/* dropdown */}
          <ComboboxContent anchor={anchor}>
            <ComboboxEmpty>No filters found.</ComboboxEmpty>
            <ComboboxList>
            {(group, index) => (
              <ComboboxGroup key={group.value} items={group.items}>
                <ComboboxLabel>{group.value}</ComboboxLabel>
                <ComboboxCollection>
                  {(item) => (
                    <ComboboxItem key={item} value={item}>
                      {item}
                    </ComboboxItem>
                  )}
                </ComboboxCollection>
                {index < recipeFilters.length - 1 && <ComboboxSeparator />}
              </ComboboxGroup>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>

    {/* pagination -- I'll come back if time */}

    {/* Recipe grid */}
    <section className="recipe-catalog">
      {recipes.map(recipeData => (
        <div key={recipeData.id}>
          <RecipeCard recipeData={recipeData}/>
        </div>
      ))}
    </section>

    </main>
  )
}






// explanation of the first few ts lines...
// Overall: make a type -> union of all constant strings
  // without as const -> typeof returns String[], [number] returns String

// makes value of the array pointed as literals and made readonly (not string)

// indexing by "number" -> indexes every index (instead of 0, 1, etc...) -> returns union of element types
// RecipeFilter = 'All Recipes' | 'Official Only' | 'User-Generated'