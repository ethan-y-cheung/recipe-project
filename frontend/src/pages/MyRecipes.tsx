import axios from "axios";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Star, Search } from "lucide-react";
import "../styles/MyRecipes.css";
import type { Recipe, User, Tag } from "../../../shared/types/index.ts";
import { useAuth } from "@/contexts/AuthContext.tsx";

export default function MyRecipes() {
    const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
    const [createdRecipes, setCreatedRecipes] = useState<Recipe[]>([]);
    const [activeView, setActiveView] = useState<"created" | "saved">(
        "created",
    );
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    // const [fetchError, setFetchError] = useState<string | null>(null)
    const { currentUser, userData } = useAuth();

    const BASE_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const fetchRecipes = async () => {
            setIsLoading(true);
            if (!currentUser || !userData) {
                setIsLoading(false);
                return;
            }
            try {
                const username = userData?.username;

                const token = await currentUser.getIdToken();

                const headers = {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                };
                const encodedUserId = encodeURIComponent(username);

                const [createdResponse, savedResponse] = await Promise.all([
                    axios.get(
                        `${BASE_URL}/userrecipe/${encodedUserId}/created`,
                        { headers },
                    ),
                    axios.get(`${BASE_URL}/userrecipe/${encodedUserId}/saved`, {
                        headers,
                    }),
                ]);

                const createdData: Recipe[] = createdResponse.data;
                const savedData: Recipe[] = savedResponse.data;

                setCreatedRecipes(createdData);
                setSavedRecipes(savedData);
            } catch (error: unknown) {
                console.error("Recipe retrieval failure:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRecipes();
    }, [currentUser, userData]);

    const activeRecipesList =
        activeView === "created" ? createdRecipes : savedRecipes;

    const filteredRecipes = activeRecipesList.filter((recipe) => {
        const matchesTitle = recipe.title
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
        const matchesTags =
            recipe.tags?.some((tag) =>
                tag.name.toLowerCase().includes(searchQuery.toLowerCase()),
            ) ?? false;
        return matchesTitle || matchesTags;
    });

    const currentRecipe =
        activeIndex !== null ? filteredRecipes[activeIndex] : null;

    const totalRatingScore =
        currentRecipe?.rating?.reduce<number>(
            (sum, r) => sum + (r.value ?? 0),
            0,
        ) || 0;
    const averageRating = currentRecipe?.rating?.length
        ? Math.round(totalRatingScore / currentRecipe.rating.length)
        : 0;

    return (
        <>
            <div className="recipe-container">
                <header className="app-header">
                    <div className="logo">
                        My<span>Recipes</span>
                    </div>
                    <Link to="/create">
                        <button className="btn-primary">
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                            Create New Recipe
                        </button>
                    </Link>
                </header>

                <div className="split-screen-container">
                    <aside
                        className={`master-sidebar ${!isPreviewOpen ? "expanded" : ""}`}
                    >
                        <div className="sidebar-controls">
                            <div className="search-input-wrapper">
                                <Search className="search-icon" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search recipes or tags..."
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setActiveIndex(
                                            isPreviewOpen ? 0 : null,
                                        );
                                    }}
                                />
                            </div>
                            <div className="filter-row">
                                <label className="checkbox-container">
                                    <input
                                        type="checkbox"
                                        checked={activeView === "created"}
                                        onChange={() => {
                                            setActiveView("created");
                                            setActiveIndex(
                                                isPreviewOpen ? 0 : null,
                                            );
                                        }}
                                    />
                                    <span className="checkmark"></span>
                                    Created Recipes
                                </label>
                                <label className="checkbox-container">
                                    <input
                                        type="checkbox"
                                        checked={activeView === "saved"}
                                        onChange={() => {
                                            setActiveView("saved");
                                            setActiveIndex(
                                                isPreviewOpen ? 0 : null,
                                            );
                                        }}
                                    />
                                    <span className="checkmark"></span>
                                    Saved Recipes
                                </label>
                            </div>
                        </div>
                        <div className="preview-grid">
                            {filteredRecipes.length === 0 ? (
                                <div className="sidebar-empty">
                                    No recipes found
                                </div>
                            ) : (
                                filteredRecipes.map((recipe, idx) => {
                                    // Calculate average preview rating stars
                                    const cardTotal =
                                        recipe.rating?.reduce<number>(
                                            (sum, r) => sum + (r.value ?? 0),
                                            0,
                                        ) || 0;
                                    const cardAvg = recipe.rating?.length
                                        ? Math.round(
                                              cardTotal / recipe.rating.length,
                                          )
                                        : 0;

                                    return (
                                        <div
                                            key={recipe.id}
                                            className={`preview-card ${idx === activeIndex ? "active-card" : ""}`}
                                            onClick={() => {
                                                setActiveIndex(idx);
                                                setIsPreviewOpen(true);
                                            }}
                                        >
                                            <div className="preview-image-wrapper">
                                                {recipe.images &&
                                                recipe.images.length > 0 ? (
                                                    <img
                                                        src={recipe.images[0]}
                                                        alt={recipe.title}
                                                    />
                                                ) : (
                                                    <div className="preview-fallback">
                                                        🥘
                                                    </div>
                                                )}
                                            </div>
                                            <div className="preview-card-details">
                                                <h4>{recipe.title}</h4>
                                                <div className="preview-stars">
                                                    {[1, 2, 3, 4, 5].map(
                                                        (star) => (
                                                            <Star
                                                                key={star}
                                                                size={11}
                                                                fill={
                                                                    star <=
                                                                    cardAvg
                                                                        ? "#FFB800"
                                                                        : "transparent"
                                                                }
                                                                stroke={
                                                                    star <=
                                                                    cardAvg
                                                                        ? "#FFB800"
                                                                        : "#CCCCCC"
                                                                }
                                                                strokeLinejoin="round"
                                                                strokeLinecap="round"
                                                            />
                                                        ),
                                                    )}
                                                </div>
                                                {recipe.tags &&
                                                    recipe.tags.length > 0 && (
                                                        <span className="preview-tag-badge">
                                                            {
                                                                recipe.tags[0]
                                                                    .name
                                                            }
                                                        </span>
                                                    )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </aside>
                    <main
                        className={`detail-pane ${!isPreviewOpen ? "collapsed" : ""}`}
                        id="recipeDisplayArea"
                    >
                        {filteredRecipes.length === 0 || !currentRecipe ? (
                            <div className="recipe-card">
                                <div className="empty-state">
                                    <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                                        />
                                    </svg>
                                    <h2>No Recipes Selected</h2>
                                    <p>
                                        Try adjusting your search or create a
                                        new recipe!
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="recipe-card">
                                <div className="recipe-header-row">
                                    <div className="recipe-title-wrapper">
                                        <button
                                            className="close-preview-btn"
                                            onClick={() => {
                                                setIsPreviewOpen(false);
                                                setActiveIndex(null);
                                            }}
                                            title="Close Preview"
                                        >
                                            &larr; Close Preview
                                        </button>
                                        <h2 className="recipe-title">
                                            {currentRecipe.title}
                                        </h2>
                                    </div>

                                    <div className="recipe-actions">
                                        <button
                                            className="icon-btn"
                                            title="Edit Recipe"
                                            disabled={activeView === "saved"}
                                        >
                                            <svg
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                />
                                            </svg>
                                        </button>

                                        <button
                                            className="icon-btn"
                                            title="Delete Recipe"
                                        >
                                            <svg
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                />
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                <div className="recipe-grid">
                                    <div className="recipe-visual-column">
                                        <div className="recipe-meta-box">
                                            <div className="recipe-meta-item">
                                                <span className="meta-label">
                                                    Made By:{" "}
                                                </span>
                                                <span
                                                    className="meta-value"
                                                    title={
                                                        currentRecipe?.creator_ID ||
                                                        "Unknown"
                                                    }
                                                >
                                                    {currentRecipe.user_generated
                                                        ? currentRecipe.creator_ID ||
                                                          "Unknown Creator"
                                                        : "Community Recipe"}
                                                </span>
                                            </div>
                                            <div className="recipe-meta-item">
                                                <span className="meta-label">
                                                    Created:
                                                </span>
                                                <span className="meta-value">
                                                    {currentRecipe.created_at
                                                        ? new Date(
                                                              currentRecipe.created_at,
                                                          ).toLocaleDateString(
                                                              undefined,
                                                              {
                                                                  year: "numeric",
                                                                  month: "short",
                                                                  day: "numeric",
                                                              },
                                                          )
                                                        : "N/A"}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="recipe-image-box">
                                            {currentRecipe.images &&
                                            currentRecipe.images.length > 0 ? (
                                                <img
                                                    src={
                                                        currentRecipe.images[0]
                                                    }
                                                    alt={currentRecipe.title}
                                                />
                                            ) : (
                                                <svg
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="1.2"
                                                >
                                                    <rect
                                                        x="3"
                                                        y="3"
                                                        width="18"
                                                        height="18"
                                                        rx="2"
                                                        ry="2"
                                                    />
                                                    <circle
                                                        cx="8.5"
                                                        cy="8.5"
                                                        r="1.5"
                                                    />
                                                    <polyline points="21 15 16 10 5 21" />
                                                </svg>
                                            )}
                                        </div>

                                        <div className="rating-wrapper">
                                            <span>Rating:</span>
                                            <div className="stars">
                                                {[1, 2, 3, 4, 5].map((star) => {
                                                    const isActive =
                                                        star <= averageRating;
                                                    return (
                                                        <Star
                                                            key={star}
                                                            size={20}
                                                            className={`star-icon ${isActive ? "active" : ""}`}
                                                            fill={
                                                                isActive
                                                                    ? "currentColor"
                                                                    : "transparent"
                                                            }
                                                            stroke="currentColor"
                                                        />
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        <div className="tags-wrapper">
                                            <span className="tags-label">
                                                Tags:{" "}
                                                {currentRecipe.tags &&
                                                currentRecipe.tags.length > 0
                                                    ? currentRecipe.tags
                                                          .map(
                                                              (t: Tag) =>
                                                                  t.name,
                                                          )
                                                          .join(", ")
                                                    : "None"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="info-card-box">
                                        <h3>Ingredients</h3>
                                        <div className="content-body">
                                            {" "}
                                            {currentRecipe.ingredients?.map(
                                                (
                                                    item: {
                                                        quantity: string;
                                                        name: string;
                                                    },
                                                    idx: number,
                                                ) => (
                                                    <div key={idx}>
                                                        •{" "}
                                                        <strong>
                                                            {item.quantity}
                                                        </strong>{" "}
                                                        {item.name}
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    </div>

                                    <div className="info-card-box">
                                        <h3>Instructions</h3>
                                        <div className="content-body">
                                            {" "}
                                            {currentRecipe.instructions?.map(
                                                (step: string, idx: number) => (
                                                    <div key={idx}>
                                                        <strong>
                                                            {idx + 1}.
                                                        </strong>{" "}
                                                        {step}
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="recipe-footer-link-row">
                                    <Link to={`/recipe/${currentRecipe.title}`}>
                                        <button className="btn-view-full">
                                            View Full Recipe &rarr;
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </>
    );
}
