import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <div className="navbar-logo-circle">♥</div>
        <span className="navbar-title">Recipe</span>
      </div>
      <ul className="navbar-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/recipes">Recipes</Link></li>
        <li><Link to="/create">Create Recipe</Link></li>
        <li><Link to="/my-recipes">My Recipes</Link></li>
      </ul>
      <div className="navbar-auth">
        <button className="nav-btn-login">Log In</button>
        <button className="nav-btn-signup">Sign Up</button>
      </div>
    </nav>
  )
}
