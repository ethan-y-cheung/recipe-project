import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="home">
      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-text">
            <p className="hero-eyebrow">Welcome to</p>
            <h1 className="hero-heading">
              Recipe <span className="hero-pink">Website</span>
            </h1>
            <p className="hero-desc">
              Discover recipes, save your favorites,
              <br />
              and share your creations with our
              <br />
              community.
            </p>
            <div className="hero-btns">
              <Link to="/recipes" className="hero-btn-primary">
                Browse Recipes
              </Link>
              <Link to="/create" className="hero-btn-secondary">
                Create a Recipe
              </Link>
            </div>
          </div>
          <div className="hero-img-wrap">
            <img
              src="/hero-food-pic.jpg"
              alt="Delicious food"
              className="hero-img"
            />
          </div>
        </div>
      </section>

      {/* ── Wave Divider ── */}
      <div className="wave-divider">
        <svg
          viewBox="0 0 1440 90"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,55 C300,90 600,20 900,55 C1100,75 1300,35 1440,50 L1440,0 L0,0 Z"
            fill="#F6F4E8"
          />
        </svg>
      </div>

      {/* ── Cards ── */}
      <section className="cards-section">
        <h2 className="cards-heading">What would you like to do?</h2>
        <div className="cards">
          <Link to="/recipes" className="card card-green">
            <div className="card-icon">🔍</div>
            <div className="card-body">
              <p className="card-name">Browse Recipes</p>
              <p className="card-desc">
                Explore official and community recipes.
              </p>
            </div>
            <span className="card-arrow">→</span>
          </Link>
          <Link to="/create" className="card card-rose">
            <div className="card-icon">+</div>
            <div className="card-body">
              <p className="card-name">Create a Recipe</p>
              <p className="card-desc">Share your recipe with the community.</p>
            </div>
            <span className="card-arrow">→</span>
          </Link>
          <Link to="/my-recipes" className="card card-cream">
            <div className="card-icon">♡</div>
            <div className="card-body">
              <p className="card-name">My Recipes</p>
              <p className="card-desc">View your created and saved recipes.</p>
            </div>
            <span className="card-arrow">→</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
