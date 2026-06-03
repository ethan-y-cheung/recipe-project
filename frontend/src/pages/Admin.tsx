import { useEffect, useState } from "react";
import axios from "axios";
import type { Recipe } from "../../../shared/types";

export default function Admin() {
  const [pendingRecipes, setPendingRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response : { data: Recipe[] } = await axios.get("/api/recipes/pending");
        const data = response.data;
        const filteredData = data.filter((recipe) => !recipe.approved);
        setPendingRecipes(filteredData);
      } catch (error) {
        console.error("Error fetching pending recipes:", error);
      }
    };
    fetchRecipes();
  }, []);
  
  return <>
    <body>
      <table className="admin-table">
        <thead>
            <tr>
                <th>Date Submitted</th>
                <th>Title</th>
                <th>Author</th>
                <th>Status</th>
                <th>Recipe</th>
                <th>Approve</th>
                <th>Deny</th>
            </tr>
        </thead>

        <tbody>
            {pendingRecipes.map((recipe) => (
                <tr key={recipe.recipe_ID}>
                    <td>
                        {recipe.created_at?.toLocaleDateString()}
                    </td>

                    <td>{recipe.title}</td>

                    <td>{recipe.creator_ID}</td>

                    <td>
                        {recipe.approved ? "Approved" : "Pending"}
                    </td>

                    <td>
                        <button
                          onClick={() => setSelectedRecipe(recipe)}
                        >
                            View Details
                        </button>
                    </td>

                    <td>
                        <button
                            onClick={() =>
                                approveRecipe(recipe.recipe_ID)
                            }
                        >
                            Approve
                        </button>
                    </td>

                    <td>
                        <button
                            onClick={() =>
                                denyRecipe(recipe.recipe_ID)
                            }
                        >
                            Deny
                        </button>
                    </td>
                </tr>
            ))}
        </tbody>
    </table>
    </body>
  </>
}
