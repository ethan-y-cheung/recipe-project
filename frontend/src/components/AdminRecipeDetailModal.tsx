import type { Recipe } from "../../../shared/types";
import RecipeDetail from "../pages/RecipeDetail";

import "../styles/Admin.css";
import "../styles/common.css";
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
                <button className="close-btn"
                onClick={onClose}>
                    ✕
                </button>
                <div className="review-header">

                    <h2>Recipe Review</h2>
                </div>

                <div className="review-actions">

                    <button className="approve-btn"
                        onClick={() =>
                            onApprove(recipe.recipe_ID)
                        }
                    >
                        Approve
                    </button>

                    <button className="deny-btn"
                        onClick={() =>
                            onDeny(recipe.recipe_ID)
                        }
                    >
                        Deny
                    </button>

                </div>

                <RecipeDetail/> //need to modify this to include recipe data

            </div>

        </div>
    );
}