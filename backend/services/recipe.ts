import type { Recipe } from "../../shared/types/index.js"


export async function getRecipesTheMealDB(maxRecipes: number) : Promise<Recipe[]>
{
    let recipes: Recipe[] = [];
    for(let i = 0; i < maxRecipes; i++)
    {
        const response = await fetch("https://www.themealdb.com/api/json/v1/1/random.php");
        const data : any = await response.json();
        const meal = data.meals?.[0];

        if(meal)
        {
            const convertedMeal = convertMealDBRecipe(meal);
            console.log("Recipe type meal: " + convertedMeal);
            recipes.push(convertedMeal);
        }

    }
    return recipes;    
    
}

export async function getRecipeMealDBById(id: string): Promise<Recipe | null> {
    try {
        const response = await fetch(
            `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`
        );

        const data: any = await response.json();
        const meal = data.meals?.[0];

        if (!meal) return null;

        return convertMealDBRecipe(meal);
    } catch (err) {
        console.error("MealDB fetch failed:", err);
        return null;
    }
}


function convertMealDBRecipe(
    meal: any
): Recipe {

    const ingredients = [];

    for (let i = 1; i <= 20; i++) {

        const ingredient =
            meal[`strIngredient${i}`];

        const quantity =
            meal[`strMeasure${i}`];

        if (
            ingredient &&
            ingredient.trim() !== ""
        ) {
            ingredients.push({
                name: ingredient,
                quantity:
                    quantity?.trim() ?? ""
            });
        }
    }

    const instructions =
        meal.strInstructions
            ?.split(/\r?\n/)
            .map((step: string) =>
                step.trim()
            )
            .filter(Boolean) ?? [];

    return {
        id: meal.idMeal,

        user_generated: false,

        creator_ID: null,

        title: meal.strMeal,

        created_at: meal.dateModified
            ? new Date(meal.dateModified)
            : null,

        tags: [
            {
                name: meal.strCategory,
                type: "category"
            },
            {
                name: meal.strArea,
                type: "cuisine"
            }
        ].filter(
            tag => tag.name
        ),

        ingredients,

        instructions,

        images: [
            meal.strMealThumb
        ],

        rating: [],

        approved: true
    };
}