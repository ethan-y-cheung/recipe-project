import { useEffect, useState } from "react";
import axios from "axios";
import type { Recipe } from "../../../shared/types";

import AdminRecipeDetailModal from "../components/AdminRecipeDetailModal";

import "../styles/Admin.css";
import "../styles/common.css";

export default function Admin() {
  const [pendingRecipes, setPendingRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const RECIPES_PER_PAGE = 3;

  const startIndex = (currentPage - 1) * RECIPES_PER_PAGE;
  const endIndex = startIndex + RECIPES_PER_PAGE;

  const visibleRecipes = pendingRecipes.slice(
      startIndex,
      endIndex
  );

  const totalPages = Math.ceil(
    pendingRecipes.length / RECIPES_PER_PAGE
  );

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response : { data: Recipe[] } = await axios.get(`${import.meta.env.VITE_API_URL}/test/recipes`);
        const data = response.data;
        console.log("response data" + data);
        const filteredData = data.filter((recipe) => !recipe.approved);
        setPendingRecipes(filteredData);
      } catch (error) {
        console.error("Error fetching pending recipes:", error);
      }
    };
    fetchRecipes();
  }, []);
  
  const approveRecipe = async (id: string) => {
    // axios call to firebase and set approved to true
    console.log(`Approving recipe with ID: ${id}`);
  }
  const denyRecipe = async (id: string) => {
    // axios call to delete recipe from db
    console.log(`Denying recipe with ID: ${id}`);
  }
  return <>

      <header>
          <h1 className="admin-title">Admin Panel</h1>
      </header>
      {
        selectedRecipe && (
            <AdminRecipeDetailModal
                recipe={selectedRecipe}
                onClose={() =>
                    setSelectedRecipe(null)
                }
                onApprove={approveRecipe}
                onDeny={denyRecipe}
            />
        )
      }
      <div className="admin-page">
        <div className="recipe-list">
          <div className="recipe-list-header">
              <span>Date</span>
              <span>Title</span>
              <span>Author</span>
              <span>Actions</span>
          </div>

          {visibleRecipes.map(recipe => (
              <div
                  key={recipe.id}
                  className="recipe-row"
              >
                  <span>{recipe.created_at instanceof Date ? recipe.created_at.toLocaleDateString() : "n/a"}</span>

                  <span>{recipe.title}</span>

                  <span>{recipe.creator_ID}</span>

                  <div className="action-buttons">
                      <button 
                        className="review-btn"
                        onClick={() => setSelectedRecipe(recipe)}
                      >
                        Review
                      </button>

                      <button 
                        className="approve-btn"
                        onClick={() => approveRecipe(recipe.id)}
                      >
                        Approve
                      </button>

                      <button className="deny-btn"
                        onClick={() => denyRecipe(recipe.id)}
                      >
                          Deny
                      </button>
                  </div>
              </div>
          ))}
      </div>
    </div>  

    <div className="pgn-container">

      <button
          className= "pgn-btn"
          disabled = {currentPage === 1}
          onClick={() =>
              setCurrentPage(prev => prev - 1)
          }
      >
          Previous
      </button>

      <span>
          Page {currentPage} of {totalPages}
      </span>

      <button
          className = "pgn-btn"
          disabled = {currentPage === totalPages}
          onClick={() =>
              setCurrentPage(prev => prev + 1)
          }
      >
          Next
      </button>
    </div>
  </>
}
