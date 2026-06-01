import { useParams } from 'react-router-dom'

export default function RecipeDetail() {
  const { recipeType, recipeId } = useParams()
  return (
    <div>
      <h1>Recipe Detail Page</h1>
      <p>Type: {recipeType} | ID: {recipeId}</p>
    </div>
  )
}
