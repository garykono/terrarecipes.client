import styles from './FeaturedRecipe.module.css';
import { Link } from "react-router-dom";
import { Recipe } from '../../api/types/recipe';
import Button from '../buttons/Button';

interface FeaturedRecipeProps {
    recipe: Recipe
    className?: string;
}

export default function FeaturedRecipe({ recipe, className }: FeaturedRecipeProps) {
    return(
        <div className={`grid grid--cols-2 ${styles.featuredRecipe} ${className}`}>
            <img 
                className={styles.img}
                src={recipe.image? recipe.image : "https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png"}
            />
            <div className={styles.recipeBody}>
                <div className={styles.recipeContent}>
                    <h2 className={`section-title ${styles.recipeTitle}`}>{recipe.name}</h2>
                    <p className={`text ${styles.recipeDescription}`}>{recipe.description}</p>
                </div>
                <div className={styles.recipeButtonLink}>
                    
                    <Link to={`/recipe/${recipe._id}`}>
                        <Button primary>Go to Recipe</Button>
                    </Link>
                </div>
            </div>   
        </div>
    );
}