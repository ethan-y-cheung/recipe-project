import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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

  const navigate = useNavigate();
  const { recipeId } = useParams();

  useEffect(() => {
    if (!recipeId) {
        setSelectedRecipe(null);
        return;
    }

    const recipe = pendingRecipes.find(r => r.id === recipeId);

    if (recipe) {
        setSelectedRecipe(recipe);
    }
    }, [recipeId, pendingRecipes]);

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
      navigate("/admin");
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
      navigate("/admin");
    } catch (error) {
      console.error("Error denying recipe:", error);
      setError("Failed to deny recipe. Please try again.");
    }
  };

  const viewDetails = (recipe: Recipe) =>
  {
    console.log("viewing details of: ", recipe)

    navigate(`/admin/${recipe.id}`)
  }
  return <>

      {
        selectedRecipe && (
            <AdminRecipeDetailModal
                recipe={selectedRecipe}
                onClose={() =>
                    navigate("/admin")
                }
                onApprove={approveRecipe}
                onDeny={denyRecipe}
            />
        )
      }
      <div className="admin-page">
        <header>
            <h1 className="admin-title">Admin Panel</h1>
            <p className="admin-subtitle">Click a recipe to review it, then approve or deny it.</p>
        </header>
        {error && (
          <div className="admin-error" onClick={() => setError(null)}>
            {error}
          </div>
        )}
        <div className="recipe-list-wrapper"><div className="recipe-list">
          <div className="recipe-list-header">
              <span>Date</span>
              <span>Title</span>
              <span>Author</span>
              <span>Tags</span>
              <span>Actions</span>
          </div>

          {pendingRecipes.length === 0 && (
            <div className="admin-empty">No recipes pending review.</div>
          )}

          {visibleRecipes.map(recipe => (
              <div
                  key={recipe.id}
                  className="recipe-row"
                  onClick={() => viewDetails(recipe)}
              >
                  <span>{recipe.created_at instanceof Date ? recipe.created_at.toLocaleDateString() : "n/a"}</span>

                  <span>{recipe.title}</span>

                  <span>{recipe.creator_ID}</span>

                  <div className="admin-tags">
                    {recipe.tags.map((tag, i) => (
                      <span key={i} className="admin-tag">{tag.name}</span>
                    ))}
                  </div>

                  <div className="action-buttons">
                      <button
                        className="approve-btn"
                        onClick={(e) => { e.stopPropagation(); approveRecipe(recipe.id); }}
                      >
                        Approve
                      </button>

                      <button className="deny-btn"
                        onClick={(e) => { e.stopPropagation(); denyRecipe(recipe.id); }}
                      >
                          Deny
                      </button>
                  </div>
              </div>
          ))}
      </div>
    </div></div>

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
