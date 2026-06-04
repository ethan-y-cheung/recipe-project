import { useState, useEffect } from 'react'
import '../styles/Recipes.css'
import axios from 'axios';

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

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

import RecipeCard from '../components/RecipeCard';

// mock data... I'll use the mock data from backend endpoint (or actual API) instead next work period
// using the common ts type definitions
import { recipes } from './recipeData';
import type { RecipeType } from './recipeData';

const FILTER_OPTIONS = ['All Recipes', 'Official Only', 'User-Generated'] as const
type RecipeFilter = (typeof FILTER_OPTIONS)[number]

const recipesPerPage = 4 as const; // default # recipes shown per page


// will fetch from backend instead once connected to firebase
// are technically tags... will rename

// assign colors to tags of specific types
// todo: replace w/ actual filters
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



export default function Recipes() {

  // Page number
  const [page, setPage] = useState<number>(0);
  console.log(page);

  // Active displayed recipe type(s) (all, official, user generated)
  const [activeFilter, setActiveFilter] = useState<RecipeFilter>('All Recipes');
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [tagFilter, setTagFilter] = useState<string[]>([]);

  const [filteredRecipes, setFilteredRecipes] = useState<RecipeType[]>([]);

  // Runs side effects for filtering displayed recipes
  useEffect(() => {
    const noFiltersApplied = activeFilter === 'All Recipes' && !searchFilter && tagFilter.length === 0;

    const fetchData = async () => {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/test/recipes`);
      const data = response.data;
      console.log("data", data);

      if(noFiltersApplied) {
        setFilteredRecipes(recipes);
        return;
      }

      // todo: change to actual filtered recipes
      setFilteredRecipes([]);
    }
    fetchData();
  }, [activeFilter, searchFilter, tagFilter])

  useEffect(() => {
    // pull all data
    // set recipe data, unfiltered;
  }, [])

  // Helper: Returns array with numbers from start (inlcude) to stop (exclusive)
  const createRange = (start: number, stop: number) => {
    const length = (stop - start) + 1;
    const range: number[] = [];
    for (let i = 0; i < length; i++) {
      range.push(start + i);
    }
    return range;
  };

  // const nextPage = () => {
  //   // unfiltered recipes/
  //   const totalPages = 
  //   if (page + 1 <= Math.ceil()) {
  //     setPage(page + 1);
  //   }
  // }

  // console.log(searchFilter === 'All Recipes');
  // console.log(!activeFilter);
  // console.log(tagFilter.length);
  // console.log(tagFilter)

  const anchor = useComboboxAnchor()

  return (
    <main className="recipes-page-main">

      {/* Header block */}
      <header className="recipes-heading">
        <div className="recipes-heading__text">
          <p className="recipes-heading__subtitle">
            <span><Search /></span>
            {/* Browse */}
          </p>
          <h2 className="recipes-heading__title">Explore <span className="recipe-heading__title--red">Recipes</span></h2>
          <p className="recipes-heading__subtitle">
            Discover new favorites from our growing recipe collection.
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

          <InputGroupInput
            value={searchFilter}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchFilter(e.target.value)}
            placeholder="Search..."
          />
        </InputGroup>

        {/* add mobile dimension for tag filter */}
        {/* Tags dropdown filter      if time, limit to X tags */}
        <Combobox items={recipeFilters} value={tagFilter} onValueChange={(newValue: string[]) => setTagFilter(newValue)} multiple aria-label="Tag Filtering Dropdwon">

          {/* filter input trigger */}
          <ComboboxChips ref={anchor} className="recipe-search-row__combobox">
            <ComboboxValue>
              {(values) => (
                <>
                  {values.map((value: string) => (
                    <ComboboxChip key={value} aria-label={value}>{value}</ComboboxChip>
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

    {/* Recipe grid */}
    <section className="recipe-catalog">
      {filteredRecipes.map(recipeData => (
        <div key={recipeData.id}>
          <RecipeCard recipeData={recipeData}/>
        </div>
      ))}
      {filteredRecipes.length === 0 &&
        <div className="recipe-catalog__empty">
          <p className="recipe-catalog__empty-text">No matching recipes found.</p>
        </div>}
    </section>

    {/* Pagination (page numbers...) */}
    <Pagination>
      <PaginationContent>

        <PaginationItem className={page > 1 ? '': 'recipe-catalog__pagination--disabled'}> {/*previous button*/}
          <PaginationPrevious />
          {/* href="#" */}
        </PaginationItem>

        {/* maps page numbers to button links */}

        {/* todo: stop if number if > max pages */}
        {createRange(page - 1, page + 2).map((pageNumber: number) => 
          pageNumber > 0 && (
          <PaginationItem key={pageNumber}>
            <PaginationLink 
              onClick={() => setPage(pageNumber)}
              isActive={pageNumber === page}
              >
                {pageNumber}
            </PaginationLink>
          </PaginationItem>)
        )}
        
        {/* <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem> */}
        
        <PaginationItem> {/*next button*/}
          <PaginationNext onClick={() => {setPage(page + 1)}}/>
        </PaginationItem>

      </PaginationContent>
    </Pagination>

    </main>
  )
}




// backend
// - fetching all tags
// - randomize combined fetched recipes - limit to 20 (?)
  // - fetch recipes from api
  // - fetch user-generated recipes + all associated tags
// error handling

// ----------------------------
// pagination
// jest testing



// explanation of the first few ts lines...
// Overall: make a type -> union of all constant strings
  // without as const -> typeof returns String[], [number] returns String

// makes value of the array pointed as literals and made readonly (not string)

// indexing by "number" -> indexes every index (instead of 0, 1, etc...) -> returns union of element types
// RecipeFilter = 'All Recipes' | 'Official Only' | 'User-Generated'