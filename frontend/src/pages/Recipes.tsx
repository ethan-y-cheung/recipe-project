import { useState, useEffect } from 'react'
import '../styles/Recipes.css'
import axios from 'axios';

import { useAuth } from '../contexts/AuthContext.tsx';

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
  // PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

import RecipeCard from '../components/RecipeCard';

import type { Recipe, User as AppUser } from '../../../shared/types/index.ts';

import toast, { Toaster } from 'react-hot-toast';





const FILTER_OPTIONS = ['All Recipes', 'Official Only', 'User-Generated Only'] as const
type RecipeFilter = (typeof FILTER_OPTIONS)[number]

const recipesPerPage = 8 as const; // default # recipes shown per page

// any pre-populated filters -> can be pulled from firebase as desired
const recipeFilters: { value: string; items: string[] }[] = []
//   {
//     value: "Meal Type",
//     items: ["Breakfast", "Lunch", "Dinner", "Snack", "Dessert"],
//   },
//   {
//     value: "Dietary Restrictions",
//     items: ["Vegetarian", "Vegan", "Gluten-free", "Dairy-free", "Nut-free"],
//   },
// ];

export default function Recipes() {

  // Page number
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Active displayed recipe type(s) (all, official, user generated)
  const [activeFilter, setActiveFilter] = useState<RecipeFilter>('All Recipes');
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [tagFilter, setTagFilter] = useState<string[]>([]);

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [recipeTags, setRecipeTags] = useState<{value: string, items: string[]}[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"

  const { currentUser, userData, refreshUser } = useAuth(); // for: retrieving user auth token, laoding initial saved recipe list
  const [localUserData, setLocalUserData] = useState<AppUser | null>(userData);

  useEffect(() => {
    setLocalUserData(userData);
  }, [userData]);

  // Fetch recipes on first load--------------------------------------
  useEffect(() => {

    // helper - extracts and populates tag options for dropdown filter
    const buildRecipeFilters = (recipeList: Recipe[]) => {
      console.log('calling .map and .forEach on: ', recipeList);
      try {
        const filterMap = new Map<string, Set<string>>(
          recipeFilters.map((filter) => [
            filter.value, // tag type
            new Set(filter.items),  // set of tag names under that type
          ])
        );

        // O(n^2)... for each recipe, for each tag in each recipe
        recipeList.forEach((recipe) => {
          recipe.tags.forEach(({ type, name }) => {
            if (!filterMap.has(type)) {
              filterMap.set(type, new Set());
            }

            filterMap.get(type)!.add(name);
          });
        });

        return Array.from(filterMap.entries()).map(([value, items]) => ({
          value,
          items: [...items],
        }));
      }
      catch (err) {
        console.log(`Error building recipe filters: ${err}`);
      }
    };

    // helper - grab a temporary viewing url for user uploaded images
    const viewPhoto = async (fileKey : string) => {
      try {
        const { data } = await axios.post(`${API_URL}/aws/get-view-url`, { fileKey });
        console.log(data.viewUrl);
        return data.viewUrl;
      } catch (error) {
        console.error("Error loading image from S3:", error);
      }
    }

    // plant AWS photo urls as needed
    const plantPhotos = async (recipeList: Recipe[]): Promise<Recipe[]> => {
      return Promise.all(
        recipeList.map(async (recipe) => {
          // console.log('aws recipe: ', recipe);
          // not user generated - can use directly, are photo links
          if (!recipe.user_generated) {
            console.log('official recipe');
            return {
              ...recipe,
              imageUrls: recipe.images,
            };
          }

          console.log('loading user gen image');
          // user generated - await the fetch for image links from AWS
          const imageUrls = await Promise.all(
            recipe.images.map((fileKey) =>
              viewPhoto("recipes/1780519947700-Screenshot 2026-06-02 at 3.22.27 PM.png")
              // fileKey ? viewPhoto(fileKey) : null
            )
          );
          return {
            ...recipe,
            imageUrls,
          };
        })
      );
    };

    // use to randomize recipe order
    const shuffleArray = async (array: Recipe[]) => {
      const shuffled = [...array]; //copy
      
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      
      return shuffled;
    }

    const fetchData = async () => {
      try {

        console.log('calling /recipes');

        const response = await axios.get(`${API_URL}/recipes`, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        console.log('called /recipes in backend');

        let data: Recipe[] = response.data
        console.log("full recipe list", data);

        data = await plantPhotos(data);
        data = await shuffleArray(data);

        console.log("full recipe list after planting photos", data);

        setRecipeTags(buildRecipeFilters(data));
        setTotalPages(Math.ceil(data.length/recipesPerPage));

        setRecipes(data); // load full recipe list
        setFilteredRecipes(data.slice(page - 1, page * recipesPerPage)); // load recipe list on **1st** page       
      }
      catch (err) {
        console.log(`An error occured Recipes.tsx while fetching recipe data: ${err}`)
      }
    }

    fetchData();
  }, [currentUser])



  // Filter displayed recipes--------------------------------------
  // dependencies: active page (ex. Official Recipes Only, search string, tags selected, page #
  useEffect(() => {

    let filteredRecipes = recipes;

    // helper - filter by active page (ex. Official Recipes Only)
    const filterByActivePage = (recipeList: Recipe[], activeFilter: string) => {
      if(activeFilter !== 'All Recipes') {
        const filteredList = recipeList.filter(recipe => (
          activeFilter === 'Official Only' ? 
            (recipe.user_generated === false)
            :
            (recipe.user_generated === true)
        ));
        return filteredList;
      }
      return recipeList;
    }

    // helper - filter by search string
    const filterBySearchQuery = (recipeList: Recipe[], searchFilter: string) => {
      const filteredList = recipeList.filter(recipe => (
        [recipe.creator_ID, recipe.title].join('').replace(/\s/g, '').toLowerCase().includes(searchFilter.replace(/\s/g, '').toLowerCase())
      ));
      return filteredList;
    }

    // helper - filter by selected tags
    const filterByTags = (recipeList: Recipe[], tagFilter: string[]) => {
      if(tagFilter.length < 1) return recipeList; // don't apply filter if no tags selected

      const tagString = tagFilter.join('').replace(/\s/g, '').toLowerCase();
      filteredRecipes = recipeList.filter(recipe => (
        recipe.tags.some(tag => (tagString.includes(tag.name.toLowerCase().replace(/\s/g, ''))))
      ));
      console.log(tagFilter);
      return filteredRecipes;
    }

    // ----------------------------------------------
    // Call helper functions to perform filters - skip if not filters applyed
    const noFiltersApplied = activeFilter === 'All Recipes' && !searchFilter && tagFilter.length === 0;
    if (!noFiltersApplied) {

      filteredRecipes = filterByActivePage(filteredRecipes, activeFilter);
      filteredRecipes = filterBySearchQuery(filteredRecipes, searchFilter);
      filteredRecipes = filterByTags(filteredRecipes, tagFilter);

      setFilteredRecipes(filteredRecipes);
    }

    setTotalPages(Math.ceil(filteredRecipes.length/recipesPerPage));
    const recipesOnCurrentPage = filteredRecipes.slice((page - 1) * recipesPerPage, (page * recipesPerPage))
    setFilteredRecipes(recipesOnCurrentPage);

  }, [activeFilter, searchFilter, tagFilter, page])




  // Helper (for pagination): Returns array with page #s from start (inlcude) to stop (exclusive)-----------
  // ------- within bounds of 1 and totalPages (useState)
  const loadAdjacentPageNumbers = (start: number, stop: number) => {
    const length = (stop - start) + 1;
    const range: number[] = [];
    for (let i = 0; i < length; i++) {
      if (start + i > totalPages) continue; // prevent adding invalid page numbers
      range.push(start + i);
    }
    return range;
  };


  // Handle saving and deleting saved recipes
  const handleSave = async (recipeId: string, currentlySaved: boolean) => {
    if (!currentUser) return;

    const token = await currentUser.getIdToken();
    try {
      const response = await fetch(`${API_URL}/users/saved-recipes/${recipeId}`, {
        method: currentlySaved ? 'DELETE' : 'POST',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      // error
      if (!response.ok) {
        toast.error(`Failed to saved recipe: ${await response.text()}`);
        console.error('Failed to update saved recipe:', await response.text());
        return;
      }

      // success - removed/added
      if (currentlySaved) {
        toast.success("Removed recipe from saved", {
          icon: '🗑️',
        });
      }
      else {
        toast.success("Added recipe to saved");
      }
      
      const updatedUser = await response.json();
      setLocalUserData(updatedUser);
      refreshUser();
    } catch (err) {
      console.error('Save toggle failed:', err);
    }
  }

  // console.log(currentUser, userData);
  const anchor = useComboboxAnchor() // for positioning tags dropdown filter

  return (
    <main className="recipes-page-main">

      <Toaster />

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

        {/* Tags dropdown filter */}
        <Combobox items={recipeTags} value={tagFilter} onValueChange={(newValue: string[]) => {setTagFilter(newValue); setPage(1)}}
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
            <RecipeCard
              recipeData={recipeData}
              isSaved={localUserData ? localUserData.saved_recipes.some(recipe => recipe.recipe_id === recipeData.id) : false}
              onSave={handleSave}
            />
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

          <p style={{'color': 'gray'}}>of {totalPages} pages</p>

        </PaginationContent>
      </Pagination>

    </main>
  )
}