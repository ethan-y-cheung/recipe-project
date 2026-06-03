import express from 'express';
import { Recipe, Tag } from '../../shared/types/index';
const router = express.Router();
router.get('/', (req : express.Request, res : express.Response) => {
    res.status(200).json({ message: 'Test route is working!' });
});
router.get('/recipes', (req : express.Request, res : express.Response) => {
    const sampleRecipes: Recipe[] = [
        {   //base sample recipe
<<<<<<< HEAD
            id: '1', //id should key into database, maybe we append source or recipe to front
=======
            recipe_ID: '1', //id should key into database, maybe we append source or recipe to front
>>>>>>> bddd9f3 (fix: readding test files, sry about that)
            creator_ID: "Janet",
            user_generated: true,
            title: 'Sample Recipe 1',
            created_at: new Date("2026-06-02"),
<<<<<<< HEAD
            approved: false,
=======
>>>>>>> bddd9f3 (fix: readding test files, sry about that)
            tags: [{name :"lunch", type: "Meal Type"}, {name: "quick", type: "Difficulty"}],
            ingredients: [{
                name: 'Ingredient 1',
                quantity: 'Quantity 1'
            },
            {
                name: 'Ingredient 2',
                quantity: 'Quantity 2'
            },
            {
                name: 'Ingredient 3',
                quantity: 'Quantity 3'
            }
            ],
            instructions: [
                'Instruction 1',
                'Instruction 2',
                'Instruction 3'
            ],
            images: [
                "https://www.themealdb.com/images/media/meals/ustsqw1468250014.jpg"
            ],
            rating: [{
                user_ID: 'user1',
                value: 5
            },
            {
                user_ID: 'user2',
                value: 4
            },]
        },
        {   //sample without image
<<<<<<< HEAD
            id: '2', 
=======
            recipe_ID: '2', 
>>>>>>> bddd9f3 (fix: readding test files, sry about that)
            creator_ID: "Mark",
            user_generated: true,
            title: 'Sample Recipe 2',
            created_at: new Date("2026-06-02"),
<<<<<<< HEAD
            approved: false,
=======
>>>>>>> bddd9f3 (fix: readding test files, sry about that)
            tags: [{name :"lunch", type: "Meal Type"}, {name: "quick", type: "Difficulty"}],
            ingredients: [{
                name: 'Ingredient 1',
                quantity: 'Quantity 1'
            },
            {
                name: 'Ingredient 2',
                quantity: 'Quantity 2'
            },
            {
                name: 'Ingredient 3',
                quantity: 'Quantity 3'
            }
            ],
            instructions: [
                'Instruction 1',
                'Instruction 2',
                'Instruction 3'
            ],
            images: [
            ],
            rating: [{
                user_ID: 'user1',
                value: 5
            },
            {
                user_ID: 'user2',
                value: 4
            },]
        },
        {   //sample no tags
<<<<<<< HEAD
            id: '3', 
=======
            recipe_ID: '3', 
>>>>>>> bddd9f3 (fix: readding test files, sry about that)
            creator_ID: "michael",
            user_generated: true,
            title: 'Sample Recipe 2',
            created_at: new Date("2026-06-02"),
<<<<<<< HEAD
            approved: false,
=======
>>>>>>> bddd9f3 (fix: readding test files, sry about that)
            tags: [],
            ingredients: [{
                name: 'Ingredient 1',
                quantity: 'Quantity 1'
            },
            {
                name: 'Ingredient 2',
                quantity: 'Quantity 2'
            },
            {
                name: 'Ingredient 3',
                quantity: 'Quantity 3'
            }
            ],
            instructions: [
                'Instruction 1',
                'Instruction 2',
                'Instruction 3'
            ],
            images: [
                "https://www.themealdb.com/images/media/meals/ustsqw1468250014.jpg"
            ],
            rating: [{
                user_ID: 'user1',
                value: 5
            },
            {
                user_ID: 'user2',
                value: 4
            },]
        },
        {   //sample no rating
<<<<<<< HEAD
            id: '4', 
=======
            recipe_ID: '4', 
>>>>>>> bddd9f3 (fix: readding test files, sry about that)
            creator_ID: "michael",
            user_generated: true,
            title: 'Sample Recipe 2',
            created_at: new Date("2026-06-02"),
<<<<<<< HEAD
            approved: false,
=======
>>>>>>> bddd9f3 (fix: readding test files, sry about that)
            tags: [{name :"lunch", type: "Meal Type"}, {name: "quick", type: "Difficulty"}],
            ingredients: [{
                name: 'Ingredient 1',
                quantity: 'Quantity 1'
            },
            {
                name: 'Ingredient 2',
                quantity: 'Quantity 2'
            },
            {
                name: 'Ingredient 3',
                quantity: 'Quantity 3'
            }
            ],
            instructions: [
                'Instruction 1',
                'Instruction 2',
                'Instruction 3'
            ],
            images: [
                "https://www.themealdb.com/images/media/meals/ustsqw1468250014.jpg"
            ],
            rating: []
        },
        {   //sample no ingredients
<<<<<<< HEAD
            id: '5',
=======
            recipe_ID: '5',
>>>>>>> bddd9f3 (fix: readding test files, sry about that)
            creator_ID: "Janet",
            user_generated: true,
            title: 'Sample Recipe 1',
            created_at: new Date("2026-06-02"),
<<<<<<< HEAD
            approved: false,
=======
>>>>>>> bddd9f3 (fix: readding test files, sry about that)
            tags: [{name :"lunch", type: "Meal Type"}, {name: "quick", type: "Difficulty"}],
            ingredients: [{
                name: 'Ingredient 1',
                quantity: 'Quantity 1'
            },
            {
                name: 'Ingredient 2',
                quantity: 'Quantity 2'
            },
            {
                name: 'Ingredient 3',
                quantity: 'Quantity 3'
            }
            ],
            instructions: [
                'Instruction 1',
                'Instruction 2',
                'Instruction 3'
            ],
            images: [
                "https://www.themealdb.com/images/media/meals/ustsqw1468250014.jpg"
            ],
            rating: [{
                user_ID: 'user1',
                value: 5
            },
            {
                user_ID: 'user2',
                value: 4
            },]
        },
        {   //sample many ingredients
<<<<<<< HEAD
            id: '6',
=======
            recipe_ID: '6',
>>>>>>> bddd9f3 (fix: readding test files, sry about that)
            creator_ID: "Mia",
            user_generated: true,
            title: 'Sample Recipe 1',
            created_at: new Date("2026-06-02"),
<<<<<<< HEAD
            approved: false,
=======
>>>>>>> bddd9f3 (fix: readding test files, sry about that)
            tags: [{name :"lunch", type: "Meal Type"}, {name: "quick", type: "Difficulty"}],
            ingredients: [{
                name: 'Ingredient 1',
                quantity: 'Quantity 1'
            },
            {
                name: 'Ingredient 2',
                quantity: 'Quantity 2'
            },
            {
                name: 'Ingredient 3',
                quantity: 'Quantity 3'
            },
            {
                name: 'Ingredient 4',
                quantity: 'Quantity 1'
            },
            {
                name: 'Ingredient 5',
                quantity: 'Quantity 2'
            },
            {
                name: 'Ingredient 6',
                quantity: 'Quantity 3'
            },
            {
                name: 'Ingredient 7',
                quantity: 'Quantity 1'
            },
            {
                name: 'Ingredient 8',
                quantity: 'Quantity 2'
            },
            {
                name: 'Ingredient 9',
                quantity: 'Quantity 3'
            }
            ],
            instructions: [
                'Instruction 1',
                'Instruction 2',
                'Instruction 3'
            ],
            images: [
                "https://www.themealdb.com/images/media/meals/ustsqw1468250014.jpg"
            ],
            rating: [{
                user_ID: 'user1',
                value: 5
            },
            {
                user_ID: 'user2',
                value: 4
            },]
        },
        {   //sample no instructions (maybe invalid)
<<<<<<< HEAD
            id: '7',
=======
            recipe_ID: '7',
>>>>>>> bddd9f3 (fix: readding test files, sry about that)
            creator_ID: "Lucinda",
            user_generated: true,
            title: 'Sample Recipe 1',
            created_at: new Date("2026-06-02"),
<<<<<<< HEAD
            approved: false,
=======
>>>>>>> bddd9f3 (fix: readding test files, sry about that)
            tags: [{name :"lunch", type: "Meal Type"}, {name: "quick", type: "Difficulty"}],
            ingredients: [{
                name: 'Ingredient 1',
                quantity: 'Quantity 1'
            },
            {
                name: 'Ingredient 2',
                quantity: 'Quantity 2'
            },
            {
                name: 'Ingredient 3',
                quantity: 'Quantity 3'
            }
            ],
            instructions: [
            ],
            images: [
                "https://www.themealdb.com/images/media/meals/ustsqw1468250014.jpg"
            ],
            rating: [{
                user_ID: 'user1',
                value: 5
            },
            {
                user_ID: 'user2',
                value: 4
            },]
        },
        {   //sample many instructions
<<<<<<< HEAD
            id: '8',
=======
            recipe_ID: '8',
>>>>>>> bddd9f3 (fix: readding test files, sry about that)
            creator_ID: "Jane_Doe",
            user_generated: true,
            title: 'Sample Recipe 1',
            created_at: new Date("2026-06-02"),
<<<<<<< HEAD
            approved: false,
=======
>>>>>>> bddd9f3 (fix: readding test files, sry about that)
            tags: [{name :"lunch", type: "Meal Type"}, {name: "quick", type: "Difficulty"}],
            ingredients: [{
                name: 'Ingredient 1',
                quantity: 'Quantity 1'
            },
            {
                name: 'Ingredient 2',
                quantity: 'Quantity 2'
            },
            {
                name: 'Ingredient 3',
                quantity: 'Quantity 3'
            }
            ],
            instructions: [
                'Instruction 1 Filler Text Filler Text Filler Text',
                'Instruction 2 Filler Text Filler Text Filler Text' ,
                'Instruction 3 Filler Text Filler Text Filler Text',
                'Instruction 4 Filler Text Filler Text Filler Text',
                'Instruction 5 Filler Text Filler Text Filler Text',
                'Instruction 6 Filler Text Filler Text Filler Text'
            ],
            images: [
                "https://www.themealdb.com/images/media/meals/ustsqw1468250014.jpg"
            ],
            rating: [{
                user_ID: 'user1',
                value: 5
            },
            {
                user_ID: 'user2',
                value: 4
            },]
        },        
        {   //sample with user_generated false (shouldn't change much just to test)
<<<<<<< HEAD
            id: '9',
=======
            recipe_ID: '9',
>>>>>>> bddd9f3 (fix: readding test files, sry about that)
            creator_ID: "Molly",
            user_generated: false,
            title: 'Sample Recipe 1',
            created_at: new Date("2026-06-02"),
<<<<<<< HEAD
            approved: false,
=======
>>>>>>> bddd9f3 (fix: readding test files, sry about that)
            tags: [{name :"lunch", type: "Meal Type"}, {name: "quick", type: "Difficulty"}],
            ingredients: [{
                name: 'Ingredient 1',
                quantity: 'Quantity 1'
            },
            {
                name: 'Ingredient 2',
                quantity: 'Quantity 2'
            },
            {
                name: 'Ingredient 3',
                quantity: 'Quantity 3'
            }
            ],
            instructions: [
                'Instruction 1',
                'Instruction 2',
                'Instruction 3'
            ],
            images: [
                "https://www.themealdb.com/images/media/meals/ustsqw1468250014.jpg"
            ],
            rating: [{
                user_ID: 'user1',
                value: 5
            },
            {
                user_ID: 'user2',
                value: 4
            },]
        },
    ];
<<<<<<< HEAD
    res.status(200).json(sampleRecipes);
=======
    res.status(200).json({ recipes: sampleRecipes });
>>>>>>> bddd9f3 (fix: readding test files, sry about that)
});
export default router;