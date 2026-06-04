import { useEffect, useState } from "react";
import axios from "axios";
import type { Recipe } from "../../../shared/types";
import { useAuth } from "../contexts/AuthContext";

import AdminRecipeDetailModal from "../components/AdminRecipeDetailModal";

import "../styles/Admin.css";
import "../styles/common.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Admin() {
  const { currentUser } = useAuth();
  const [pendingRecipes, setPendingRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const RECIPES_PER_PAGE = 8;

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
      if (!currentUser) return;
      try {
        const token = await currentUser.getIdToken();
        const response = await axios.get<Recipe[]>(`${API_URL}/admin/pending-recipes`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPendingRecipes(response.data);
      } catch (error) {
        console.error("Error fetching pending recipes:", error);
      }
    };
    fetchRecipes();
  }, [currentUser]);

  const approveRecipe = async (id: string) => {
    if (!currentUser) return;
    try {
      const token = await currentUser.getIdToken();
      await axios.patch(`${API_URL}/admin/recipes/${id}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPendingRecipes(prev => prev.filter(r => r.id !== id));
      setSelectedRecipe(null);
    } catch (error) {
      console.error("Error approving recipe:", error);
      setError("Failed to approve recipe. Please try again.");
    }
  };

  const denyRecipe = async (id: string) => {
    if (!currentUser) return;
    try {
      const token = await currentUser.getIdToken();
      await axios.delete(`${API_URL}/admin/recipes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPendingRecipes(prev => prev.filter(r => r.id !== id));
      setSelectedRecipe(null);
    } catch (error) {
      console.error("Error denying recipe:", error);
      setError("Failed to deny recipe. Please try again.");
    }
  };
  return <>

      <header>
          <h1 className="admin-title">Admin Panel</h1>
      </header>
      {error && (
        <div className="admin-error" onClick={() => setError(null)}>
          {error}
        </div>
      )}
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

          {pendingRecipes.length === 0 && (
            <div className="admin-empty">No recipes pending review.</div>
          )}

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

    {totalPages > 1 && <div className="pgn-container">

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
    </div>}
  </>
}
