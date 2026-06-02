import './Recipes.css'

export default function Recipes() {
  return (
    <header className="recipes-heading">
      <div className="recipes-heading__text">
        <h2 className="recipes-heading__title">Explore <span className="">Recipes</span></h2>
        <p className="recipes-heading__subtitle">
          Find your next favorite meal from our growing recipe collection.
        </p>
      </div>
      <img
        className="recipes-heading__image"
        src="https://media-cldnry.s-nbcnews.com/image/upload/t_social_share_1200x630_center,f_auto,q_auto:best/newscms/2024_28/2067113/keep-it-zesty-chicken-shawarma-2x1-mc-240712.jpg"
        alt="An assortment of dishes spread across a table"
      />
    </header>
  )
}
