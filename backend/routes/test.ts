import express from "express";
import { Recipe, Tag } from "../../shared/types/index";
const router = express.Router();
router.get("/", (req: express.Request, res: express.Response) => {
    res.status(200).json({ message: "Test route is working!" });
});
router.get("/recipes", (req: express.Request, res: express.Response) => {
    const sampleRecipes: Recipe[] = [
        {
            //base sample recipe
            id: "1", //id should key into database, maybe we append source or recipe to front
            creator_ID: "Janet",
            user_generated: true,
            title: "Sample Recipe 1",
            created_at: new Date("2026-06-02"),
            approved: false,
            tags: [
                { name: "lunch", type: "Meal Type" },
                { name: "quick", type: "Difficulty" },
            ],
            ingredients: [
                {
                    name: "Ingredient 1",
                    quantity: "Quantity 1",
                },
                {
                    name: "Ingredient 2",
                    quantity: "Quantity 2",
                },
                {
                    name: "Ingredient 3",
                    quantity: "Quantity 3",
                },
            ],
            instructions: ["Instruction 1", "Instruction 2", "Instruction 3"],
            images: [
                "https://www.themealdb.com/images/media/meals/ustsqw1468250014.jpg",
            ],
            rating: [
                {
                    user_ID: "user1",
                    value: 5,
                },
                {
                    user_ID: "user2",
                    value: 4,
                },
            ],
        },
        {
            //sample without image
            id: "2",
            creator_ID: "Mark",
            user_generated: true,
            title: "Sample Recipe 2",
            created_at: new Date("2026-06-02"),
            approved: false,
            tags: [
                { name: "lunch", type: "Meal Type" },
                { name: "quick", type: "Difficulty" },
            ],
            ingredients: [
                {
                    name: "Ingredient 1",
                    quantity: "Quantity 1",
                },
                {
                    name: "Ingredient 2",
                    quantity: "Quantity 2",
                },
                {
                    name: "Ingredient 3",
                    quantity: "Quantity 3",
                },
            ],
            instructions: ["Instruction 1", "Instruction 2", "Instruction 3"],
            images: [],
            rating: [
                {
                    user_ID: "user1",
                    value: 5,
                },
                {
                    user_ID: "user2",
                    value: 4,
                },
            ],
        },
        {
            //sample no tags
            id: "3",
            creator_ID: "michael",
            user_generated: true,
            title: "Sample Recipe 2",
            created_at: new Date("2026-06-02"),
            approved: false,
            tags: [],
            ingredients: [
                {
                    name: "Ingredient 1",
                    quantity: "Quantity 1",
                },
                {
                    name: "Ingredient 2",
                    quantity: "Quantity 2",
                },
                {
                    name: "Ingredient 3",
                    quantity: "Quantity 3",
                },
            ],
            instructions: ["Instruction 1", "Instruction 2", "Instruction 3"],
            images: [
                "https://www.themealdb.com/images/media/meals/ustsqw1468250014.jpg",
            ],
            rating: [
                {
                    user_ID: "user1",
                    value: 5,
                },
                {
                    user_ID: "user2",
                    value: 4,
                },
            ],
        },
        {
            //sample no rating
            id: "4",
            creator_ID: "michael",
            user_generated: true,
            title: "Sample Recipe 2",
            created_at: new Date("2026-06-02"),
            approved: false,
            tags: [
                { name: "lunch", type: "Meal Type" },
                { name: "quick", type: "Difficulty" },
            ],
            ingredients: [
                {
                    name: "Ingredient 1",
                    quantity: "Quantity 1",
                },
                {
                    name: "Ingredient 2",
                    quantity: "Quantity 2",
                },
                {
                    name: "Ingredient 3",
                    quantity: "Quantity 3",
                },
            ],
            instructions: ["Instruction 1", "Instruction 2", "Instruction 3"],
            images: [
                "https://www.themealdb.com/images/media/meals/ustsqw1468250014.jpg",
            ],
            rating: [],
        },
        {
            //sample no ingredients
            id: "5",
            creator_ID: "Janet",
            user_generated: true,
            title: "Sample Recipe 1",
            created_at: new Date("2026-06-02"),
            approved: false,
            tags: [
                { name: "lunch", type: "Meal Type" },
                { name: "quick", type: "Difficulty" },
            ],
            ingredients: [
                {
                    name: "Ingredient 1",
                    quantity: "Quantity 1",
                },
                {
                    name: "Ingredient 2",
                    quantity: "Quantity 2",
                },
                {
                    name: "Ingredient 3",
                    quantity: "Quantity 3",
                },
            ],
            instructions: ["Instruction 1", "Instruction 2", "Instruction 3"],
            images: [
                "https://www.themealdb.com/images/media/meals/ustsqw1468250014.jpg",
            ],
            rating: [
                {
                    user_ID: "user1",
                    value: 5,
                },
                {
                    user_ID: "user2",
                    value: 4,
                },
            ],
        },
        {
            //sample many ingredients
            id: "6",
            creator_ID: "Mia",
            user_generated: true,
            title: "Sample Recipe 1",
            created_at: new Date("2026-06-02"),
            approved: false,
            tags: [
                { name: "lunch", type: "Meal Type" },
                { name: "quick", type: "Difficulty" },
            ],
            ingredients: [
                {
                    name: "Ingredient 1",
                    quantity: "Quantity 1",
                },
                {
                    name: "Ingredient 2",
                    quantity: "Quantity 2",
                },
                {
                    name: "Ingredient 3",
                    quantity: "Quantity 3",
                },
                {
                    name: "Ingredient 4",
                    quantity: "Quantity 1",
                },
                {
                    name: "Ingredient 5",
                    quantity: "Quantity 2",
                },
                {
                    name: "Ingredient 6",
                    quantity: "Quantity 3",
                },
                {
                    name: "Ingredient 7",
                    quantity: "Quantity 1",
                },
                {
                    name: "Ingredient 8",
                    quantity: "Quantity 2",
                },
                {
                    name: "Ingredient 9",
                    quantity: "Quantity 3",
                },
            ],
            instructions: ["Instruction 1", "Instruction 2", "Instruction 3"],
            images: [
                "https://www.themealdb.com/images/media/meals/ustsqw1468250014.jpg",
            ],
            rating: [
                {
                    user_ID: "user1",
                    value: 5,
                },
                {
                    user_ID: "user2",
                    value: 4,
                },
            ],
        },
        {
            //sample no instructions (maybe invalid)
            id: "7",
            creator_ID: "Lucinda",
            user_generated: true,
            title: "Sample Recipe 1",
            created_at: new Date("2026-06-02"),
            approved: false,
            tags: [
                { name: "lunch", type: "Meal Type" },
                { name: "quick", type: "Difficulty" },
            ],
            ingredients: [
                {
                    name: "Ingredient 1",
                    quantity: "Quantity 1",
                },
                {
                    name: "Ingredient 2",
                    quantity: "Quantity 2",
                },
                {
                    name: "Ingredient 3",
                    quantity: "Quantity 3",
                },
            ],
            instructions: [],
            images: [
                "https://www.themealdb.com/images/media/meals/ustsqw1468250014.jpg",
            ],
            rating: [
                {
                    user_ID: "user1",
                    value: 5,
                },
                {
                    user_ID: "user2",
                    value: 4,
                },
            ],
        },
        {
            //sample many instructions
            id: "8",
            creator_ID: "Jane_Doe",
            user_generated: true,
            title: "Sample Recipe 1",
            created_at: new Date("2026-06-02"),
            approved: false,
            tags: [
                { name: "lunch", type: "Meal Type" },
                { name: "quick", type: "Difficulty" },
            ],
            ingredients: [
                {
                    name: "Ingredient 1",
                    quantity: "Quantity 1",
                },
                {
                    name: "Ingredient 2",
                    quantity: "Quantity 2",
                },
                {
                    name: "Ingredient 3",
                    quantity: "Quantity 3",
                },
            ],
            instructions: [
                "Instruction 1 Filler Text Filler Text Filler Text",
                "Instruction 2 Filler Text Filler Text Filler Text",
                "Instruction 3 Filler Text Filler Text Filler Text",
                "Instruction 4 Filler Text Filler Text Filler Text",
                "Instruction 5 Filler Text Filler Text Filler Text",
                "Instruction 6 Filler Text Filler Text Filler Text",
            ],
            images: [
                "https://www.themealdb.com/images/media/meals/ustsqw1468250014.jpg",
            ],
            rating: [
                {
                    user_ID: "user1",
                    value: 5,
                },
                {
                    user_ID: "user2",
                    value: 4,
                },
            ],
        },
        {
            //sample with user_generated false (shouldn't change much just to test)
            id: "9",
            creator_ID: "Molly",
            user_generated: false,
            title: "Sample Recipe 1",
            created_at: new Date("2026-06-02"),
            approved: false,
            tags: [
                { name: "lunch", type: "Meal Type" },
                { name: "quick", type: "Difficulty" },
            ],
            ingredients: [
                {
                    name: "Ingredient 1",
                    quantity: "Quantity 1",
                },
                {
                    name: "Ingredient 2",
                    quantity: "Quantity 2",
                },
                {
                    name: "Ingredient 3",
                    quantity: "Quantity 3",
                },
            ],
            instructions: ["Instruction 1", "Instruction 2", "Instruction 3"],
            images: [
                "https://www.themealdb.com/images/media/meals/ustsqw1468250014.jpg",
            ],
            rating: [
                {
                    user_ID: "user1",
                    value: 5,
                },
                {
                    user_ID: "user2",
                    value: 4,
                },
            ],
        },
    ];
    res.status(200).json(sampleRecipes);
});
export default router;
