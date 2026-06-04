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

import type { Recipe } from '../../../shared/types/index.ts';






const FILTER_OPTIONS = ['All Recipes', 'Official Only', 'User-Generated'] as const
type RecipeFilter = (typeof FILTER_OPTIONS)[number]

const recipesPerPage = 8 as const; // default # recipes shown per page

// todo: fetch from main
// if time: change color
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
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Active displayed recipe type(s) (all, official, user generated)
  const [activeFilter, setActiveFilter] = useState<RecipeFilter>('All Recipes');
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [tagFilter, setTagFilter] = useState<string[]>([]);

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);

  const [refresh, setRefresh] = useState<boolean>(false);

  // ids of current user's saved recipes - if user saves/unsaves, re-fetch
  const [savedRecipes, setSavedRecipes] = useState([]);

  // Fetch recipes on first load--------------------------------------
  useEffect(() => {

    const fetchData = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/test/recipes`);
        let data = response.data;
        console.log("full recipe list", data);

        setRecipes(data); // load full recipe list
        // console.log('number of recipes loaded: ', data.length);
        setTotalPages(Math.ceil(data.length/recipesPerPage));
        setFilteredRecipes(data.slice(page - 1, page * recipesPerPage)); // load recipe list on **1st** page
      }
      catch (err) {
        console.log(`An error occured Recipes.tsx while fetching recipe data: ${err}`)
      }
    }

    fetchData();
  }, [])



  console.log('current page: ', page);
  console.log(searchFilter);

  // Filter displayed recipes--------------------------------------
  useEffect(() => {

    let filteredRecipes = recipes;
    let currentPage = page;

    // check if need to filter
    const noFiltersApplied = activeFilter === 'All Recipes' && !searchFilter && tagFilter.length === 0;
    if (!noFiltersApplied) {

      // .filter() by active page filter 
      if(activeFilter !== 'All Recipes') {
        filteredRecipes = filteredRecipes.filter(recipe => (
          activeFilter === 'Official Only' ? 
            (recipe.user_generated === false)
            :
            (recipe.user_generated === true)
        ));
      }

      // .filter() by recipe or author name, includes search query
      // ------- if time: also search by ingredients, tag, instructions
      filteredRecipes = filteredRecipes.filter(recipe => (
        [recipe.creator_ID, recipe.title].join('').replace(/\s/g, '').toLowerCase().includes(searchFilter.toLowerCase())
      ));

      // todo: get all tags
      // .filter() by tags includes chosen tags...

      setFilteredRecipes(filteredRecipes);
    }

    // Always calculate total pages
    console.log('filtered recipes', filteredRecipes);
    console.log('number of recipes after filtering: ', filteredRecipes.length);

    setTotalPages(Math.ceil(filteredRecipes.length/recipesPerPage));
    setFilteredRecipes(filteredRecipes.slice((currentPage - 1) * recipesPerPage, (currentPage * recipesPerPage)));
  }, [activeFilter, searchFilter, tagFilter, page])





  // Helper: Returns array with page from start (inlcude) to stop (exclusive)-----------
  // ------- within bounds of 1 and totalPages (state)
  const loadAdjacentPageNumbers = (start: number, stop: number) => {
    if (start < 1) {
      // console.log('Error loading adjacent page numbers (pagination): Start number invalid');
    }
    const length = (stop - start) + 1;
    const range: number[] = [];
    for (let i = 0; i < length; i++) {
      if (start + i > totalPages) continue; // prevent adding invalid page numbers
      range.push(start + i);
    }
    return range;
  };




  // console.log('total pages', totalPages);

  const anchor = useComboboxAnchor()

  return (
    <main className="recipes-page-main">

      {/* Header block */}
      <header className="recipes-heading">
        <div className="recipes-heading__text">
          <p className="recipes-heading__subtitle">
            <span><Search /></span>
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
      <div className="recipe-filter" role="group" aria-label="Filter recipes">
        {FILTER_OPTIONS.map((option) => (
          <button
            key={option}
            type="button"
            className={`recipe-filter__option ${option === activeFilter ? 'recipe-filter__option--active':''}`}
            aria-pressed={option === activeFilter} //indicates if pressed or not to screen readers...
            onClick={() => {setActiveFilter(option); setPage(1)}}
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
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {setSearchFilter(e.target.value); ; setPage(1)}}
            placeholder="Search..."
          />
        </InputGroup>

        {/* add mobile dimension for tag filter */}
        {/* Tags dropdown filter      if time, limit to X tags */}
        <Combobox items={recipeFilters} value={tagFilter} onValueChange={(newValue: string[]) => {setTagFilter(newValue); setPage(1)}}
          multiple aria-label="Tag Filtering Dropdwon">

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
            <RecipeCard recipeData={recipeData} isSaved={true}/>
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
            <PaginationPrevious onClick={() => {if(page - 1 > 0) setPage(page - 1)}}/>
            {/* href="#" */}
          </PaginationItem>

          {/* maps page numbers to button links */}

          {loadAdjacentPageNumbers(page - 1, page + 1).map((pageNumber: number) => 
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
          
          <PaginationItem className={page < totalPages ? '': 'recipe-catalog__pagination--disabled'}> {/*next button*/}
            <PaginationNext onClick={() => {if(page + 1 <= totalPages) setPage(page + 1)}}/>
          </PaginationItem>

        </PaginationContent>
      </Pagination>

      <p style={{'color': 'gray'}}>of {totalPages} pages</p>

    </main>
  )
}