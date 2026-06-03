export type Recipe = {
  id: string
  recipeImage: string
  recipeName: string
  authorName: string
  userGenerated: boolean
  saved: boolean
  averageRating: number
  tags: string[]
}

const recipes: Recipe[] = [
  {
    id: '1',
    recipeImage: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=800&q=80',
    recipeName: 'Chicken Shawarma',
    authorName: 'Forge Kitchen',
    userGenerated: false,
    saved: false,
    averageRating: 4.9,
    tags: ['Middle Eastern', 'Chicken', 'Dinner'],
  },
  {
    id: '2',
    recipeImage: '',
    recipeName: 'Creamy Tomato Basil Pasta',
    authorName: 'Forge Kitchen',
    userGenerated: false,
    saved: true,
    averageRating: 4.7,
    tags: ['Italian', 'Vegetarian', 'Pasta'],
  },
  {
    id: '3',
    recipeImage: '',
    recipeName: 'Spicy Korean Bibimbap',
    authorName: 'Mina Park',
    userGenerated: true,
    saved: false,
    averageRating: 4.8,
    tags: ['Korean', 'Rice Bowl', 'Spicy'],
  },
  {
    id: '4',
    recipeImage: '',
    recipeName: 'Classic Beef Tacos',
    authorName: 'Diego Ramirez',
    userGenerated: true,
    saved: false,
    averageRating: 4.5,
    tags: ['Mexican', 'Beef', 'Quick'],
  },
  {
    id: '5',
    recipeImage: '',
    recipeName: 'Fluffy Buttermilk Pancakes',
    authorName: 'Forge Kitchen',
    userGenerated: false,
    saved: false,
    averageRating: 4.6,
    tags: ['Breakfast', 'Sweet', 'Brunch'],
  },
  {
    id: '6',
    recipeImage: '',
    recipeName: 'Garlic Butter Salmon',
    authorName: 'Aisha Bello',
    userGenerated: true,
    saved: false,
    averageRating: 4.9,
    tags: ['Seafood', 'Healthy', 'Dinner'],
  },
  {
    id: '7',
    recipeImage: '',
    recipeName: 'Vegan Buddha Bowl',
    authorName: 'Sam Lee',
    userGenerated: true,
    saved: false,
    averageRating: 4.4,
    tags: ['Vegan', 'Healthy', 'Lunch'],
  },
  {
    id: '8',
    recipeImage: '',
    recipeName: 'Margherita Pizza',
    authorName: 'Forge Kitchen',
    userGenerated: false,
    saved: false,
    averageRating: 4.8,
    tags: ['Italian', 'Vegetarian', 'Pizza'],
  },
]

export default recipes;