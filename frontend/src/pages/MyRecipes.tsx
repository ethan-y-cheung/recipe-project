import axios from "axios";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Star, Search } from "lucide-react";
import "../styles/MyRecipes.css";
import type { Recipe, Tag } from "../../../shared/types/index.ts";
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

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editTitle, setEditTitle] = useState("");
    const [editTags, setEditTags] = useState("");
    const [editIngredientsText, setEditIngredientsText] = useState("");
    const [editInstructionsText, setEditInstructionsText] = useState("");
    const [editTotalTime, setEditTotalTime] = useState("");
    const [editServings, setEditServings] = useState<number>(1);
    const [isUpdating, setIsUpdating] = useState(false);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const { currentUser, userData } = useAuth();
    const username = userData?.username || currentUser?.displayName || "";

    const BASE_URL = import.meta.env.VITE_API_URL;

    // S3 stores a permanent fileKey on each user-uploaded recipe, not a URL.
    // Exchange that fileKey for a short-lived signed view URL before rendering.
    // Seeded recipes already carry real URLs, so pass those through untouched.
    const resolveImageUrls = async (recipes: Recipe[]): Promise<Recipe[]> => {
        return Promise.all(
            recipes.map(async (recipe) => {
                if (!recipe.user_generated) {
                    return { ...recipe, imageUrls: recipe.images };
                }
                const imageUrls = await Promise.all(
                    (recipe.images ?? []).map(async (fileKey) => {
                        if (!fileKey) return null;
                        try {
                            const { data } = await axios.post(
                                `${BASE_URL}/aws/get-view-url`,
                                { fileKey },
                            );
                            return data.viewUrl as string;
                        } catch (error) {
                            console.error(
                                "Error loading image from S3:",
                                error,
                            );
                            return null;
                        }
                    }),
                );
                return { ...recipe, imageUrls };
            }),
        );
    };

    const fetchRecipes = async () => {
        setIsLoading(true);
        if (!currentUser || !userData) {
            setIsLoading(false);
            return;
        }
        try {
            const token = await currentUser.getIdToken();

            const headers = {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            };
            const encodedUserId = encodeURIComponent(username);

            const [createdResponse, savedResponse] = await Promise.all([
                axios.get(`${BASE_URL}/userrecipe/${encodedUserId}/created`, {
                    headers,
                }),
                axios.get(`${BASE_URL}/userrecipe/${encodedUserId}/saved`, {
                    headers,
                }),
            ]);

            const createdData: Recipe[] = Array.isArray(createdResponse.data)
                ? createdResponse.data
                : [];
            const savedData: Recipe[] = Array.isArray(savedResponse.data)
                ? savedResponse.data
                : [];

            const [createdWithUrls, savedWithUrls] = await Promise.all([
                resolveImageUrls(createdData),
                resolveImageUrls(savedData),
            ]);

            setCreatedRecipes(createdWithUrls);
            setSavedRecipes(savedWithUrls);
        } catch (error: unknown) {
            console.error("Recipe retrieval failure:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
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

    const isOwner =
        currentRecipe?.user_generated && currentRecipe?.creator_ID === username;

    const handleOpenEditModal = () => {
        if (!currentRecipe) return;
        setEditTitle(currentRecipe.title);
        setEditTags(
            currentRecipe.tags?.map((t: Tag) => t.name).join(", ") || "",
        );

        const ingredientsFormatted =
            currentRecipe.ingredients
                ?.map((item) => `${item.quantity || ""} - ${item.name || ""}`)
                .join("\n") || "";
        setEditIngredientsText(ingredientsFormatted);

        setEditInstructionsText(currentRecipe.instructions?.join("\n") || "");
        setEditTotalTime(currentRecipe.total_time || "");
        setEditServings(currentRecipe.servings || 1);
        setIsEditModalOpen(true);
    };

    const handleUpdateRecipe = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentRecipe) return;

        setIsUpdating(true);
        try {
            const parsedTags: Tag[] = editTags
                .split(",")
                .map((t) => t.trim())
                .filter((t) => t !== "")
                .map((t) => ({ name: t, type: "tag" }));

            const parsedIngredients = editIngredientsText
                .split("\n")
                .map((line) => {
                    const separatorIdx = line.indexOf(" - ");
                    if (separatorIdx === -1) {
                        return { quantity: "", name: line.trim() };
                    }
                    const qty = line.substring(0, separatorIdx).trim();
                    const name = line.substring(separatorIdx + 3).trim();
                    return { quantity: qty, name: name };
                })
                .filter((item) => item.name !== "");

            const parsedInstructions = editInstructionsText
                .split("\n")
                .map((step) => step.trim())
                .filter((step) => step !== "");

            let token = "MOCK_DEVELOPMENT_TOKEN";
            if (currentUser) {
                token = await currentUser.getIdToken();
            }

            const headers = {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            };

            const payload = {
                username,
                updatedFields: {
                    title: editTitle,
                    tags: parsedTags,
                    ingredients: parsedIngredients,
                    instructions: parsedInstructions,
                    total_time: editTotalTime || null,
                    servings: editServings || null,
                },
            };

            await axios.put(
                `${BASE_URL}/userrecipe/recipes/${currentRecipe.id}`,
                payload,
                { headers },
            );

            await fetchRecipes();
            setIsEditModalOpen(false);
        } catch (err: unknown) {
            console.error("Failed to update recipe:", err);
            alert("Error: Failed to save recipe edits.");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDeleteOrUnsave = async () => {
        if (!currentRecipe || !username) return;

        setIsDeleting(true);
        try {
            let token = "MOCK_DEVELOPMENT_TOKEN";
            if (currentUser) {
                token = await currentUser.getIdToken();
            }

            const headers = {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            };

            if (activeView === "created") {
                const encodedUser = encodeURIComponent(username);
                await axios.delete(
                    `${BASE_URL}/userrecipe/recipes/${currentRecipe.id}?username=${encodedUser}`,
                    { headers },
                );
            } else {
                const encodedUser = encodeURIComponent(username);
                await axios.delete(
                    `${BASE_URL}/userrecipe/${encodedUser}/saved/${currentRecipe.id}`,
                    { headers },
                );
            }

            setIsPreviewOpen(false);
            setActiveIndex(null);
            await fetchRecipes();
            setIsDeleteModalOpen(false);
        } catch (err: unknown) {
            console.error("Failed to delete/unsave recipe:", err);
            alert("Error: Failed to execute removal request.");
        } finally {
            setIsDeleting(false);
        }
    };

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
                            <div className="view-toggle">
                                <button
                                    type="button"
                                    className={`view-toggle__btn${activeView === "created" ? " view-toggle__btn--active" : ""}`}
                                    onClick={() => { setActiveView("created"); setActiveIndex(isPreviewOpen ? 0 : null); }}
                                >
                                    Created
                                </button>
                                <button
                                    type="button"
                                    className={`view-toggle__btn${activeView === "saved" ? " view-toggle__btn--active" : ""}`}
                                    onClick={() => { setActiveView("saved"); setActiveIndex(isPreviewOpen ? 0 : null); }}
                                >
                                    Saved
                                </button>
                            </div>
                        </div>
                        <div className="preview-grid">
                            {isLoading ? (
                                <div className="sidebar-empty">
                                    Loading recipes...
                                </div>
                            ) : !currentUser ? (
                                <div className="sidebar-empty">
                                    Please log in to view recipes.
                                </div>
                            ) : filteredRecipes.length === 0 ? (
                                <div className="sidebar-empty">
                                    No recipes found
                                </div>
                            ) : (
                                filteredRecipes.map((recipe, idx) => {
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
                                                {(recipe.imageUrls?.[0] ??
                                                recipe.images?.[0]) ? (
                                                    <img
                                                        src={
                                                            recipe
                                                                .imageUrls?.[0] ??
                                                            recipe
                                                                .images?.[0] ??
                                                            undefined
                                                        }
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
                                            onClick={handleOpenEditModal}
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
                                            onClick={() =>
                                                setIsDeleteModalOpen(true)
                                            }
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
                                                {currentRecipe.user_generated ? (
                                                    <>
                                                        <span className="meta-label">
                                                            Time:
                                                        </span>
                                                        <span className="meta-value">
                                                            {
                                                                currentRecipe.total_time
                                                            }
                                                        </span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div> </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        <div className="recipe-image-box">
                                            {(currentRecipe.imageUrls?.[0] ??
                                            currentRecipe.images?.[0]) ? (
                                                <img
                                                    src={
                                                        currentRecipe
                                                            .imageUrls?.[0] ??
                                                        currentRecipe
                                                            .images?.[0] ??
                                                        undefined
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
                                    <Link to={`/recipes/${currentRecipe.id}`}>
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
            {isEditModalOpen && currentRecipe && (
                <div className="modal-overlay">
                    <div className="modal-box">
                        <div className="modal-header">
                            <h2>Edit Recipe</h2>
                            <button
                                className="btn-close"
                                onClick={() => setIsEditModalOpen(false)}
                            >
                                &times;
                            </button>
                        </div>
                        <form onSubmit={handleUpdateRecipe}>
                            <div className="form-group">
                                <label htmlFor="editTitle">Recipe Name</label>
                                <input
                                    type="text"
                                    id="editTitle"
                                    className="form-control"
                                    value={editTitle}
                                    onChange={(e) =>
                                        setEditTitle(e.target.value)
                                    }
                                    required
                                />
                            </div>

                            <div className="form-row-grid">
                                <div className="form-group">
                                    <label htmlFor="editTags">
                                        Tags (comma-separated)
                                    </label>
                                    <input
                                        type="text"
                                        id="editTags"
                                        className="form-control"
                                        placeholder="baking, sweet, breakfast"
                                        value={editTags}
                                        onChange={(e) =>
                                            setEditTags(e.target.value)
                                        }
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="editTotalTime">
                                        Total Time
                                    </label>
                                    <input
                                        type="text"
                                        id="editTotalTime"
                                        className="form-control"
                                        placeholder="e.g. 45 mins"
                                        value={editTotalTime}
                                        onChange={(e) =>
                                            setEditTotalTime(e.target.value)
                                        }
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="editServings">
                                        Servings
                                    </label>
                                    <input
                                        type="number"
                                        id="editServings"
                                        className="form-control"
                                        min={1}
                                        value={editServings}
                                        onChange={(e) =>
                                            setEditServings(
                                                parseInt(e.target.value) || 1,
                                            )
                                        }
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="editIngredients">
                                    Ingredients (Format: Quantity - Ingredient
                                    Name, One Per Line)
                                </label>
                                <textarea
                                    id="editIngredients"
                                    className="form-control"
                                    rows={5}
                                    placeholder={
                                        "e.g.\n2 cups - Flour\n1 tsp - Salt"
                                    }
                                    value={editIngredientsText}
                                    onChange={(e) =>
                                        setEditIngredientsText(e.target.value)
                                    }
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="editInstructions">
                                    Instructions (One Step Per Line)
                                </label>
                                <textarea
                                    id="editInstructions"
                                    className="form-control"
                                    rows={5}
                                    placeholder="Add recipe step instructions..."
                                    value={editInstructionsText}
                                    onChange={(e) =>
                                        setEditInstructionsText(e.target.value)
                                    }
                                    required
                                />
                            </div>

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="btn-cancel"
                                    onClick={() => setIsEditModalOpen(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-primary"
                                    disabled={isUpdating}
                                >
                                    {isUpdating ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isDeleteModalOpen && currentRecipe && (
                <div className="modal-overlay">
                    <div className="modal-box" style={{ maxWidth: "450px" }}>
                        <div className="modal-header">
                            <h2>
                                {activeView === "saved"
                                    ? "Remove Saved Recipe"
                                    : "Delete Recipe"}
                            </h2>
                            <button
                                className="btn-close"
                                onClick={() => setIsDeleteModalOpen(false)}
                            >
                                &times;
                            </button>
                        </div>
                        <div className="delete-modal-text">
                            {activeView === "saved" ? (
                                <>
                                    Are you sure you want to remove{" "}
                                    <strong>"{currentRecipe.title}"</strong>{" "}
                                    from your saved bookmarks list?
                                </>
                            ) : (
                                <>
                                    Are you sure you want to permanently delete{" "}
                                    <strong>"{currentRecipe.title}"</strong>?
                                    This action cannot be undone.
                                </>
                            )}
                        </div>
                        <div className="modal-actions">
                            <button
                                className="btn-cancel"
                                onClick={() => setIsDeleteModalOpen(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn-primary btn-danger"
                                onClick={handleDeleteOrUnsave}
                                disabled={isDeleting}
                            >
                                {isDeleting
                                    ? "Processing..."
                                    : activeView === "saved"
                                      ? "Yes, Remove"
                                      : "Yes, Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
