import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Recipes from './pages/Recipes'
import RecipeDetail from './pages/RecipeDetail'
import MyRecipes from './pages/MyRecipes'
import CreateRecipe from './pages/CreateRecipe'
import Admin from './pages/Admin'
import './App.css'
import './styles/common.css';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main className="page-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/recipes" element={<Recipes />} />
          <Route path="/recipes/:recipeType/:recipeId" element={<RecipeDetail />} />
          <Route path="/my-recipes" element={<MyRecipes />} />
          <Route path="/create" element={<CreateRecipe />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}

export default App
