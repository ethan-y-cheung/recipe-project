import { Link, NavLink } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <svg className="navbar-logo-heart" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
        <span className="navbar-title">Recipe</span>
      </Link>
      <ul className="navbar-links">
        <li><NavLink to="/" end>Home</NavLink></li>
        <li><NavLink to="/recipes">Recipes</NavLink></li>
        <li><NavLink to="/create">Create Recipe</NavLink></li>
        <li><NavLink to="/my-recipes">My Recipes</NavLink></li>
      </ul>
      <div className="navbar-auth">
        <button className="nav-btn-login">Log In</button>
        <button className="nav-btn-signup">Sign Up</button>
      </div>
    </nav>
  )
}
