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
    creator_ID: string | null;
    title : string;
    created_at: Date | null;
    tags: Tag[];
    ingredients: {
        name: string;
        quantity: string;
    }[];
    instructions: string[];
    images: string[]; //first index is always thumbnail
    rating: Rating[];
    total_time: string | null;
    servings: number | null; // potentially null because api doesn't include these fields
    approved: boolean;
}
export interface Rating{
    user_ID: string;
    value : (1 | 2 | 3 | 4 | 5);
}
export interface Tag{
    name: string;
    type: string;
}
export interface Comments{
    recipe_ID: string;
    creator_ID: string
    content: string;
    likes: string[]; //array of user_IDs who liked the comment
    created_at: Date;
    replies: Comments[]; //array of replies to the comment, which are also of type Comments
}
