import { Link } from "react-router-dom";
import { Recipe } from '../api/types/recipe';

interface FeaturedRecipeProps {
    recipe: Recipe
}

export default function FeaturedRecipe({ recipe }: FeaturedRecipeProps) {
    return(
        <Link to={`/recipe/${recipe._id}`}>
            <div className="box">
                <div className="columns">
                    <div className="column is-7">
                        <figure className="image is-1by1">
                            <img 
                                src={recipe.image? recipe.image : "https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png"}
                            />
                        </figure>
                    </div>
                    <div className="column is-5">
                            <div className="container">
                                <p className="title my-5">{recipe.name}</p>
                                <p className="subtitle my-3">{recipe.description}</p>
                            </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}