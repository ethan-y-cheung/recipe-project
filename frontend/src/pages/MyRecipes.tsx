import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/MyRecipes.css";
import type { Recipe } from "../../../shared/types/index.ts";

export const DUMMY_RECIPES: Recipe[] = [
    {
        recipe_ID: "rec_001",
        user_generated: true,
        creator_ID: "user_dev_sajid",
        title: "Strawberry Shortcake",
        created_at: new Date("2026-06-01T14:30:00Z"),
        tags: [
            { name: "Baking", type: "method" },
            { name: "Dessert", type: "course" },
            { name: "Sweet", type: "flavor" },
        ],
        ingredients: [
            { name: "All-purpose flour", quantity: "2 cups" },
            { name: "Granulated sugar", quantity: "1/4 cup" },
            { name: "Baking powder", quantity: "1 tbsp" },
            { name: "Salt", quantity: "1/2 tsp" },
            { name: "Unsalted butter (cold, cubed)", quantity: "1/2 cup" },
            { name: "Heavy cream", quantity: "2/3 cup" },
            { name: "Fresh strawberries (sliced)", quantity: "1 lb" },
            { name: "Whipped cream", quantity: "To taste" },
        ],
        instructions: [
            "Toss sliced strawberries with 2 tablespoons of sugar and set aside to macerate at room temperature until juicy.",
            "Whisk the flour, remaining sugar, baking powder, and salt together in a large mixing bowl.",
            "Cut the cold cubed butter into the flour mixture using a pastry cutter or your fingers until it resembles coarse crumbs.",
            "Stir in the heavy cream until a soft dough forms, taking care not to overwork it.",
            "Turn dough out onto a floured surface, pat into a 1-inch thick round, and punch out individual biscuits.",
            "Bake at 425°F (218°C) for 12 to 15 minutes until the tops are a rich golden brown crisp.",
            "Split warm shortcakes horizontally, spoon macerated strawberries over the bottom half, and cap with whipped cream.",
        ],
        images: [
            "https://images.unsplash.com/photo-1564844534614-b59febeca632?w=800&auto=format&fit=crop&q=60",
            "https://images.unsplash.com/photo-1464305795204-6f5bdf7f81b1?w=800&auto=format&fit=crop&q=60",
        ],
        rating: [
            { user_ID: "user_alex", value: 5 },
            { user_ID: "user_emily", value: 4 },
            { user_ID: "user_marcus", value: 4 },
        ],
    },
    {
        recipe_ID: "rec_002",
        user_generated: false,
        creator_ID: null,
        title: "Garlic Butter Salmon Fillet",
        created_at: null,
        tags: [
            { name: "Dinner", type: "course" },
            { name: "Seafood", type: "category" },
            { name: "Keto", type: "dietary" },
        ],
        ingredients: [
            { name: "Fresh salmon fillets", quantity: "4 pieces" },
            { name: "Unsalted butter (melted)", quantity: "3 tbsp" },
            { name: "Garlic (cloves, minced)", quantity: "5 units" },
            { name: "Fresh lemon juice", quantity: "1 tbsp" },
            { name: "Italian flat parsley (chopped)", quantity: "2 tbsp" },
            { name: "Sea salt & cracked black pepper", quantity: "To taste" },
        ],
        instructions: [
            "Preheat your home oven system to 400°F (204°C) and line a rimmed baking sheet matrix with aluminum foil sheets.",
            "Pat the salmon fillets completely dry using clean paper towels and arrange them skin-side down on the foil.",
            "Combine melted butter, minced garlic, lemon juice, salt, and pepper in a small bowl; stir vigorously to emulsify.",
            "Spoon the liquid mixture evenly over the exposed flesh of each salmon fillet.",
            "Fold the edges of the aluminum foil up and over the salmon to create a loosely sealed foil packet system.",
            "Bake for 12 to 14 minutes, then carefully unwrap the packet top and broil on high for 2 minutes to crisp the surface.",
        ],
        images: [
            "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&auto=format&fit=crop&q=60",
            "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&auto=format&fit=crop&q=60",
        ],
        rating: [
            { user_ID: "user_chef_dan", value: 5 },
            { user_ID: "user_fitness_guru", value: 5 },
        ],
    },
    {
        recipe_ID: "rec_003",
        user_generated: true,
        creator_ID: "user_baker_pro",
        title: "Widescreen Stress Tester Recipe (Extremely Long Content Mock)",
        created_at: new Date("2026-01-15T09:15:00Z"),
        tags: [
            { name: "Advanced", type: "difficulty" },
            { name: "Testing", type: "meta" },
        ],
        ingredients: [
            { name: "Test Ingredient Alpha", quantity: "100g" },
            { name: "Test Ingredient Beta", quantity: "250ml" },
            { name: "Test Ingredient Gamma", quantity: "2 tsp" },
            { name: "Test Ingredient Delta", quantity: "1/2 cup" },
            { name: "Test Ingredient Epsilon", quantity: "1 pinches" },
            { name: "Test Ingredient Zeta", quantity: "4 large" },
            { name: "Test Ingredient Eta", quantity: "3 drops" },
            { name: "Test Ingredient Theta", quantity: "15g" },
            { name: "Test Ingredient Iota", quantity: "1 bottle" },
            { name: "Test Ingredient Kappa", quantity: "2 stalks" },
            { name: "Test Ingredient Lambda", quantity: "A lot" },
        ],
        instructions: [
            "This is step one, designed to evaluate how lines wrap inside the new side-by-side flex columns.",
            "Step two adds secondary structural stress to make sure the scroll indicators handle overflowing blocks properly.",
            "Step three ensures that long paragraph blocks don't clip your pagination buttons sitting below.",
            "Step four introduces layout consistency verification tests across various screen dimensions.",
            "Step five validates component height boundaries within the container element.",
            "Step six confirms flex-shrink behaviors prevent window vertical scroll overrides.",
        ],
        images: [
            "https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=800&auto=format&fit=crop&q=60",
        ],
        rating: [],
    },
];

export default function MyRecipes() {
    const [recipes, setRecipes] = useState<Recipe[]>(DUMMY_RECIPES);
    const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
    const [createdRecipes, setCreatedRecipes] = useState<Recipe[]>([]);
    const [activeView, setActiveView] = useState<"created" | "saved">(
        "created",
    );
    const [activeIndex, setActiveIndex] = useState<number>(0);

    const filteredRecipes = recipes.filter((recipe) =>
        activeView === "created"
            ? recipe.user_generated
            : !recipe.user_generated,
    );

    const currentRecipe = filteredRecipes[activeIndex];

    const totalRatingScore =
        currentRecipe?.rating?.reduce((sum, r) => sum + r.value, 0) || 0;
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

                <div className="filter-row">
                    <label className="checkbox-container">
                        <input
                            type="checkbox"
                            checked={activeView === "created"}
                            onChange={() => {
                                setActiveView("created");
                                setActiveIndex(0);
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
                                setActiveIndex(0);
                            }}
                        />
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
                                        {currentRecipe.images &&
                                        currentRecipe.images.length > 0 ? (
                                            <img
                                                src={currentRecipe.images[0]}
                                                alt={currentRecipe.title}
                                                style={{
                                                    width: "100%",
                                                    height: "100%",
                                                    objectFit: "cover",
                                                }}
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
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <span
                                                    key={star}
                                                    className={`star ${star <= averageRating ? "active" : ""}`}
                                                >
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
                                            {currentRecipe.tags &&
                                            currentRecipe.tags.length > 0
                                                ? currentRecipe.tags
                                                      .map((t) => t.name)
                                                      .join(", ")
                                                : "None"}
                                        </span>
                                    </div>
                                </div>

                                <div className="info-card-box">
                                    <h3>Ingredients</h3>
                                    <div
                                        className="content-body"
                                        style={{ whiteSpace: "pre-line" }}
                                    >
                                        {" "}
                                        {currentRecipe.ingredients?.map(
                                            (item, idx) => (
                                                <div
                                                    key={idx}
                                                    style={{
                                                        marginBottom: "0.25rem",
                                                    }}
                                                >
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
                                    <div
                                        className="content-body"
                                        style={{ whiteSpace: "pre-line" }}
                                    >
                                        {" "}
                                        {currentRecipe.instructions?.map(
                                            (step, idx) => (
                                                <div
                                                    key={idx}
                                                    style={{
                                                        marginBottom: "0.5rem",
                                                    }}
                                                >
                                                    <strong>{idx + 1}.</strong>{" "}
                                                    {step}
                                                </div>
                                            ),
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="recipe-footer">
                                <button
                                    className="btn-nav"
                                    disabled={activeIndex === 0}
                                    onClick={() =>
                                        setActiveIndex((prev) => prev - 1)
                                    }
                                >
                                    &larr; Prev
                                </button>
                                <button
                                    className="btn-nav"
                                    disabled={
                                        activeIndex ===
                                        filteredRecipes.length - 1
                                    }
                                    onClick={() =>
                                        setActiveIndex((prev) => prev + 1)
                                    }
                                >
                                    Next &rarr;
                                </button>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </>
    );
}
