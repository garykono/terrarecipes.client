import { Recipe } from "../api/types/recipe";

interface RecipeCardProps {
    recipe: Recipe
}

function RecipeCard({ recipe }: RecipeCardProps) {
    return (
        <div className="container has-text-black">
            <figure className="image is-1by1">
                <img 
                    style={recipe.markForDelete? { opacity: 0.5 } : {}}
                    src={recipe.image? recipe.image : "https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png"}
                />
            </figure>
            <div className="container my-3 px-1">
                <p className="is-size-5">{recipe.name}</p>
            </div>
        </div>
    )
}

export default RecipeCard;