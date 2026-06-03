import type { Recipe } from "../../../shared/types";
import RecipeDetail from "../pages/RecipeDetail";
interface AdminRecipeDetailModalProps {
    recipe: Recipe;
    onClose: () => void;
    onApprove: (id: string) => void;
    onDeny: (id: string) => void;
}

export default function AdminRecipeDetailModal({
    recipe,
    onClose,
    onApprove,
    onDeny
}: AdminRecipeDetailModalProps) {
    return (
        <div className="modal-overlay">

            <div className="review-modal">

                <div className="review-header">

                    <h2>Recipe Review</h2>

                    <button onClick={onClose}>
                        ✕
                    </button>

                </div>

                <div className="review-actions">

                    <button
                        onClick={() =>
                            onApprove(recipe.recipe_ID)
                        }
                    >
                        Approve
                    </button>

                    <button
                        onClick={() =>
                            onDeny(recipe.recipe_ID)
                        }
                    >
                        Deny
                    </button>

                </div>

                <RecipeDetail recipe={recipe} />

            </div>

        </div>
    );
}