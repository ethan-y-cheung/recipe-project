import { Link } from 'react-router-dom'
import './Navbar.css'

export default function Navbar() {
  return (
    <nav className="navbar">
      <span className="navbar-logo">Recipe App</span>
      <ul className="navbar-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/recipes">Recipes</Link></li>
        <li><Link to="/create">Create Recipe</Link></li>
        <li><Link to="/my-recipes">My Recipes</Link></li>
        <li><Link to="/admin">Admin</Link></li>
      </ul>
    </nav>
  )
}
