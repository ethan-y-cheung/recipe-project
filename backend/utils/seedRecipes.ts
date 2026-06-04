import "dotenv/config";
import { db } from "../firebase.ts";
import { Recipe, Tag } from "../../shared/types/index.ts";

const DUMMY_RECIPES: Recipe[] = [
    {
        id: "rec_001",
        user_generated: true,
        creator_ID: "user_dev_sajid",
        title: "Strawberry Shortcake",
        created_at: new Date("2026-06-01T14:30:00Z"),
        tags: [
            { name: "Baking", type: "method" },
            { name: "Dessert", type: "course" },
            { name: "Sweet", type: "flavor" },
        ],
        ingredients: [
            { name: "All-purpose flour", quantity: "2 cups" },
            { name: "Granulated sugar", quantity: "1/4 cup" },
            { name: "Baking powder", quantity: "1 tbsp" },
            { name: "Salt", quantity: "1/2 tsp" },
            { name: "Unsalted butter (cold, cubed)", quantity: "1/2 cup" },
            { name: "Heavy cream", quantity: "2/3 cup" },
            { name: "Fresh strawberries (sliced)", quantity: "1 lb" },
            { name: "Whipped cream", quantity: "To taste" },
        ],
        instructions: [
            "Toss sliced strawberries with 2 tablespoons of sugar and set aside to macerate at room temperature until juicy.",
            "Whisk the flour, remaining sugar, baking powder, and salt together in a large mixing bowl.",
            "Cut the cold cubed butter into the flour mixture using a pastry cutter or your fingers until it resembles coarse crumbs.",
            "Stir in the heavy cream until a soft dough forms, taking care not to overwork it.",
            "Turn dough out onto a floured surface, pat into a 1-inch thick round, and punch out individual biscuits.",
            "Bake at 425°F (218°C) for 12 to 15 minutes until the tops are a rich golden brown crisp.",
            "Split warm shortcakes horizontally, spoon macerated strawberries over the bottom half, and cap with whipped cream.",
        ],
        images: [
            "https://images.unsplash.com/photo-1564844534614-b59febeca632?w=800&auto=format&fit=crop&q=60",
            "https://images.unsplash.com/photo-1464305795204-6f5bdf7f81b1?w=800&auto=format&fit=crop&q=60",
        ],
        rating: [
            { user_ID: "user_alex", value: 5 },
            { user_ID: "user_emily", value: 4 },
            { user_ID: "user_marcus", value: 4 },
        ],
        total_time: "45 mins",
        servings: 6,
        approved: true,
    },
    {
        id: "rec_002",
        user_generated: false,
        creator_ID: null,
        title: "Garlic Butter Salmon Fillet",
        created_at: null,
        tags: [
            { name: "Dinner", type: "course" },
            { name: "Seafood", type: "category" },
            { name: "Keto", type: "dietary" },
        ],
        ingredients: [
            { name: "Fresh salmon fillets", quantity: "4 pieces" },
            { name: "Unsalted butter (melted)", quantity: "3 tbsp" },
            { name: "Garlic (cloves, minced)", quantity: "5 units" },
            { name: "Fresh lemon juice", quantity: "1 tbsp" },
            { name: "Italian flat parsley (chopped)", quantity: "2 tbsp" },
            { name: "Sea salt & cracked black pepper", quantity: "To taste" },
        ],
        instructions: [
            "Preheat your home oven system to 400°F (204°C) and line a rimmed baking sheet matrix with aluminum foil sheets.",
            "Pat the salmon fillets completely dry using clean paper towels and arrange them skin-side down on the foil.",
            "Combine melted butter, minced garlic, lemon juice, salt, and pepper in a small bowl; stir vigorously to emulsify.",
            "Spoon the liquid mixture evenly over the exposed flesh of each salmon fillet.",
            "Fold the edges of the aluminum foil up and over the salmon to create a loosely sealed foil packet system.",
            "Bake for 12 to 14 minutes, then carefully unwrap the packet top and broil on high for 2 minutes to crisp the surface.",
        ],
        images: [
            "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&auto=format&fit=crop&q=60",
            "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&auto=format&fit=crop&q=60",
        ],
        rating: [
            { user_ID: "user_chef_dan", value: 5 },
            { user_ID: "user_fitness_guru", value: 5 },
        ],
        total_time: "25 mins",
        servings: 4,
        approved: true,
    },
    {
        id: "rec_003",
        user_generated: true,
        creator_ID: "user_baker_pro",
        title: "Widescreen Stress Tester Recipe (Extremely Long Content Mock)",
        created_at: new Date("2026-01-15T09:15:00Z"),
        tags: [
            { name: "Advanced", type: "difficulty" },
            { name: "Testing", type: "meta" },
        ],
        ingredients: [
            { name: "Test Ingredient Alpha", quantity: "100g" },
            { name: "Test Ingredient Beta", quantity: "250ml" },
            { name: "Test Ingredient Gamma", quantity: "2 tsp" },
            { name: "Test Ingredient Delta", quantity: "1/2 cup" },
            { name: "Test Ingredient Epsilon", quantity: "1 pinches" },
            { name: "Test Ingredient Zeta", quantity: "4 large" },
            { name: "Test Ingredient Eta", quantity: "3 drops" },
            { name: "Test Ingredient Theta", quantity: "15g" },
            { name: "Test Ingredient Iota", quantity: "1 bottle" },
            { name: "Test Ingredient Kappa", quantity: "2 stalks" },
            { name: "Test Ingredient Lambda", quantity: "A lot" },
        ],
        instructions: [
            "This is step one, designed to evaluate how lines wrap inside the new side-by-side flex columns.",
            "Step two adds secondary structural stress to make sure the scroll indicators handle overflowing blocks properly.",
            "Step three ensures that long paragraph blocks don't clip your pagination buttons sitting below.",
            "Step four introduces layout consistency verification tests across various screen dimensions.",
            "Step five validates component height boundaries within the container element.",
            "Step six confirms flex-shrink behaviors prevent window vertical scroll overrides.",
        ],
        images: [
            "https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=800&auto=format&fit=crop&q=60",
        ],
        rating: [],
        total_time: null, // Verifies fallback render logic when value is absent
        servings: null,
        approved: true,
    },
    {
        id: "rec_004",
        user_generated: false,
        creator_ID: null,
        title: "Classic Shakshuka",
        created_at: null,
        tags: [
            { name: "Breakfast", type: "course" },
            { name: "Middle Eastern", type: "cuisine" },
            { name: "Spicy", type: "flavor" },
        ],
        ingredients: [
            { name: "Olive oil", quantity: "2 tbsp" },
            { name: "Large onion (chopped)", quantity: "1 unit" },
            { name: "Red bell pepper (chopped)", quantity: "1 unit" },
            { name: "Garlic (cloves, minced)", quantity: "3 units" },
            { name: "Ground cumin", quantity: "1 tsp" },
            { name: "Paprika", quantity: "1 tsp" },
            { name: "Canned crushed tomatoes", quantity: "28 oz" },
            { name: "Eggs", quantity: "6 large" },
            { name: "Fresh cilantro (chopped)", quantity: "To taste" },
            { name: "Feta cheese (crumbled)", quantity: "1/4 cup" },
        ],
        instructions: [
            "Heat olive oil in a large skillet over medium heat. Add onion and bell pepper, and cook until soft (about 5 minutes).",
            "Add garlic, cumin, and paprika, stirring constantly for another minute until fragrant.",
            "Pour in the crushed tomatoes and bring to a simmer. Let it cook for 10 minutes until slightly thickened. Season with salt and pepper.",
            "Use a spoon to make 6 small wells in the sauce. Crack an egg directly into each well.",
            "Cover the skillet and simmer on low-medium heat for 5 to 8 minutes, or until the egg whites are set but yolks are still runny.",
            "Garnish with chopped cilantro and crumbled feta cheese before serving warm with crusty bread.",
        ],
        images: [
            "https://images.unsplash.com/photo-1590412200988-a436bb7050a8?w=800&auto=format&fit=crop&q=60",
        ],
        rating: [
            { user_ID: "user_foodie99", value: 5 },
            { user_ID: "user_brunch_lover", value: 4 },
        ],
        total_time: "30 mins",
        servings: 3,
        approved: true,
    },
    {
        id: "rec_005",
        user_generated: true,
        creator_ID: "user_dev_sajid",
        title: "Homemade Matcha Latte",
        created_at: new Date("2026-06-02T09:00:00Z"),
        tags: [
            { name: "Drinks", type: "course" },
            { name: "Japanese", type: "cuisine" },
            { name: "Quick", type: "difficulty" },
        ],
        ingredients: [
            { name: "Matcha green tea powder", quantity: "1.5 tsp" },
            { name: "Hot water (80°C / 176°F)", quantity: "2 oz" },
            { name: "Oat milk or Whole milk", quantity: "6 oz" },
            { name: "Maple syrup or Honey", quantity: "1 tsp" },
        ],
        instructions: [
            "Sift the matcha powder into a wide mug or bowl to ensure there are no lumps.",
            "Add hot water (just under boiling to avoid scalding) and whisk vigorously in a 'W' motion using a bamboo whisk or frother until a thick foam forms.",
            "Warm your milk of choice in a small saucepan and froth it using a handheld milk frother.",
            "Pour the warm sweetened milk over the frothed matcha, spooning the microfoam gently over the top of the latte.",
        ],
        images: [
            "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=800&auto=format&fit=crop&q=60",
        ],
        rating: [
            { user_ID: "user_matcha_fan", value: 5 },
            { user_ID: "user_healthy_bites", value: 5 },
        ],
        total_time: "5 mins",
        servings: 1,
        approved: true,
    },
];

const seedDatabase = async () => {
    console.log("Starting database seeding...");

    try {
        const uploadPromises = DUMMY_RECIPES.map(async (recipe) => {
            const { id, ...recipeData } = recipe;

            await db.collection("recipes").doc(id).set(recipeData);
            console.log(`Successfully seeded recipe: ${id} (${recipe.title})`);
        });

        await Promise.all(uploadPromises);
        console.log("\nAll mock recipes have been successfully uploaded!");
        process.exit(0);
    } catch (error) {
        console.error("Critical error seeding database:", error);
        process.exit(1);
    }
};

seedDatabase();
