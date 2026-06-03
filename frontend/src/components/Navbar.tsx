import "../styles/Navbar.css";
import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { currentUser, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 960) setOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  async function handleSignOut() {
    await signOut();
    navigate("/");
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/" className="navbar-brand-link">
          <svg
            className="navbar-logo-heart"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
          <span className="navbar-title">Recipe</span>
        </Link>
      </div>

      <ul className="navbar-links">
        <li>
          <NavLink to="/" end>
            Home
          </NavLink>
        </li>
        <li>
          <NavLink to="/recipes">Recipes</NavLink>
        </li>
        {currentUser && (
          <li>
            <NavLink to="/create">Create Recipe</NavLink>
          </li>
        )}
        {currentUser && (
          <li>
            <NavLink to="/my-recipes">My Recipes</NavLink>
          </li>
        )}
        {isAdmin && (
          <li>
            <NavLink to="/admin">Admin</NavLink>
          </li>
        )}
      </ul>

      <div className="navbar-auth">
        {currentUser ? (
          <button className="nav-btn-login" onClick={handleSignOut}>
            Log Out
          </button>
        ) : (
          <>
            <button
              className="nav-btn-login"
              onClick={() => navigate("/login", { state: { mode: "signin" } })}
            >
              Log In
            </button>
            <button
              className="nav-btn-signup"
              onClick={() => navigate("/login", { state: { mode: "signup" } })}
            >
              Sign Up
            </button>
          </>
        )}
      </div>

      <button className="navbar-hamburger" onClick={() => setOpen((o) => !o)}>
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>

      {open && (
        <div className="navbar-dropdown">
          <ul className="navbar-dropdown-links">
            <li>
              <NavLink to="/" end onClick={() => setOpen(false)}>
                Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/recipes" onClick={() => setOpen(false)}>
                Recipes
              </NavLink>
            </li>
            {currentUser && (
              <li>
                <NavLink to="/create" onClick={() => setOpen(false)}>
                  Create Recipe
                </NavLink>
              </li>
            )}
            {currentUser && (
              <li>
                <NavLink to="/my-recipes" onClick={() => setOpen(false)}>
                  My Recipes
                </NavLink>
              </li>
            )}
            {isAdmin && (
              <li>
                <NavLink to="/admin" onClick={() => setOpen(false)}>
                  Admin
                </NavLink>
              </li>
            )}
          </ul>
          <div className="navbar-dropdown-auth">
            {currentUser ? (
              <button className="nav-btn-login" onClick={handleSignOut}>
                Log Out
              </button>
            ) : (
              <>
                <button
                  className="nav-btn-login"
                  onClick={() => {
                    navigate("/login", { state: { mode: "signin" } });
                    setOpen(false);
                  }}
                >
                  Log In
                </button>
                <button
                  className="nav-btn-signup"
                  onClick={() => {
                    navigate("/login", { state: { mode: "signup" } });
                    setOpen(false);
                  }}
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
