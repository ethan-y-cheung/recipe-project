export interface UserRecipeNotes
{
    recipe_id: string;
    notes:string;
}
export interface User{
    username: string;
    email?: string;
    password: string;
    admin: boolean;
    my_recipes: UserRecipeNotes[];
    saved_recipes: UserRecipeNotes[];
}
export interface Recipe{
    id: string;
    user_generated: boolean;
    creator_ID?: string | null;
    title : string;
    created_at?: Date | null;
    approved: boolean;
    tags: Tag[];
    ingredients: {
        name: string;
        quantity: string;
    }[];
    instructions: string[];
    images: (string | null)[]; //first index is always thumbnail; null where a step has no image
    imageUrls?: (string | null)[]; // resolved signed view URLs, populated at display time
    rating: Rating[];
    total_time?: string | null;
    servings?: number | null; // potentially null because api doesn't include these fields

}
export interface Rating{
    user_ID: string;
    value : (null | 1 | 2 | 3 | 4 | 5);
}
export interface Tag{
    name: string;   
    type: string;
}
export interface Comments{
    id: string;
    recipe_ID: string;
    creator_ID: string
    content: string;
    likes: string[]; // array of user_IDs who liked the comment
    created_at: Date;
    replies: Comments[]; //array of replies to the comment, which are also of type Comments
    reply_IDs: string[];
}
