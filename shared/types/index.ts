export interface UserRecipeNotes
{
    recipeID: string;
    user_tags: string[];
    notes:string;
}
export interface User{
    username: string;
    password: string;
    admin: boolean;
    my_recipes: UserRecipeNotes[];
    saved_recipes: UserRecipeNotes[];
}
export interface Recipe{
    recipe_ID: string;
    user_generated: boolean;
    title : string;
    tags: Tag[];
    ingredients: {
        name: string;
        quantity: string;
    }[];
    images: string[]; //first index is always thumbnail
    rating: (1 | 2 | 3 | 4 | 5)[];
}
export interface Tag{
    name: string;
    type: string;
}
export interface Comments{
    recipe_ID: string;
}