import { useState } from "react";
import "../styles/MyRecipes.css";

export default function MyRecipes() {
    const [filteredRecipes, setFilteredRecipes] = useState([1, 2, 3, 4]);
    return (
        <>
            <div className="recipe-container">
                <header className="app-header">
                    <div className="logo">
                        My<span>Recipes</span>
                    </div>
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
                </header>

                <div className="filter-row">
                    <label className="checkbox-container">
                        <input type="checkbox" />
                        <span className="checkmark"></span>
                        Created Recipes
                    </label>
                    <label className="checkbox-container">
                        <input type="checkbox" />
                        <span className="checkmark"></span>
                        Saved Recipes
                    </label>
                </div>

                <main id="recipeDisplayArea">
                    {filteredRecipes.length === 0 ? (
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
                                    Toggle the filters under the header or
                                    create a new recipe to get started!
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="recipe-card">
                            <div className="recipe-header-row">
                                <h2 className="recipe-title">TITLE</h2>
                                <div className="recipe-actions">
                                    <button
                                        className="icon-btn"
                                        title="Edit Recipe"
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
                                    <div className="recipe-image-box">
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
                                            <circle cx="8.5" cy="8.5" r="1.5" />
                                            <polyline points="21 15 16 10 5 21" />
                                        </svg>
                                    </div>

                                    <div className="rating-wrapper">
                                        <span>Rating:</span>
                                        <div className="stars">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <span key={star}>
                                                    <svg viewBox="0 0 24 24">
                                                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                                    </svg>
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="tags-wrapper">
                                        <span className="tags-label">
                                            Tags:{" "}
                                        </span>
                                    </div>
                                </div>

                                <div className="info-card-box">
                                    <h3>Ingredients</h3>
                                    <div
                                        className="content-body"
                                        style={{ whiteSpace: "pre-line" }}
                                    ></div>
                                </div>

                                <div className="info-card-box">
                                    <h3>Instructions</h3>
                                    <div
                                        className="content-body"
                                        style={{ whiteSpace: "pre-line" }}
                                    ></div>
                                </div>
                            </div>

                            <div className="recipe-footer">
                                <button className="btn-nav">&larr; Prev</button>
                                <button className="btn-nav">Next &rarr;</button>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </>
    );
}
