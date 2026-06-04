import type { Recipe, Tag } from "../../shared/types/index.ts";

export const fetchRecipeById = async (id: string): Promise<Recipe | null> => {
    try {
        const response = await fetch(
            `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`,
        );

        if (!response.ok) {
            console.warn(`The MealDB API failed to resolve ID: ${id}`);
            return null;
        }

        const data = await response.json();

        if (!data.meals || data.meals.length === 0) {
            console.warn(
                `No meal data found inside The MealDB envelope for ID: ${id}`,
            );
            return null;
        }

        const meal = data.meals[0];

        const ingredients: { name: string; quantity: string }[] = [];

        for (let i = 1; i <= 20; i++) {
            const name = meal[`strIngredient${i}`];
            const quantity = meal[`strMeasure${i}`];

            if (name && name.trim() !== "") {
                ingredients.push({
                    name: name.trim(),
                    quantity: quantity ? quantity.trim() : "",
                });
            }
        }

        const instructions: string[] = meal.strInstructions
            ? meal.strInstructions
                  .split(/\r?\n/)
                  .map((step: string) => step.trim())
                  .filter((step: string) => step.length > 0)
            : [];

        const tags: Tag[] = [];
        if (meal.strCategory)
            tags.push({ name: meal.strCategory, type: "category" });
        if (meal.strArea) tags.push({ name: meal.strArea, type: "cuisine" });

        if (meal.strTags) {
            meal.strTags.split(",").forEach((tag: string) => {
                const trimmed = tag.trim();
                if (trimmed && !tags.some((t) => t.name === trimmed)) {
                    tags.push({ name: trimmed, type: "tag" });
                }
            });
        }

        const images: string[] = meal.strMealThumb ? [meal.strMealThumb] : [];

        return {
            id: meal.idMeal,
            user_generated: false,
            creator_ID: null,
            title: meal.strMeal,
            created_at: null,
            tags,
            ingredients,
            instructions,
            images,
            rating: [],
            total_time: null,
            servings: null,
            approved: true,
        } as Recipe;
    } catch (err) {
        console.error(
            `Network fault executing The MealDB lookup for ID: ${id}`,
            err,
        );
        return null;
    }
};

export const fetchMultipleRecipes = async (
    ids: string[],
): Promise<Recipe[]> => {
    if (!ids || ids.length === 0) return [];

    const apiFetchPromises = ids.map((id) => fetchRecipeById(id));
    const resolvedRecipes = await Promise.all(apiFetchPromises);

    return resolvedRecipes.filter(
        (recipe): recipe is Recipe => recipe !== null,
    );
};
