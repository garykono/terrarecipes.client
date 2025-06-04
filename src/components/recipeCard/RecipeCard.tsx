import styles from './RecipeCard.module.css';
import { RecipeWithMarkForDelete } from "../../api/types/recipe";

interface RecipeCardProps {
    recipe: RecipeWithMarkForDelete;
    className?: string;
}

function RecipeCard({ recipe, className }: RecipeCardProps) {
    return (
        <div className={`box ${styles.recipeCard} ${className}`}>
            <img 
                className={styles.img}
                style={recipe.markForDelete? { opacity: 0.5 } : {}}
                src={recipe.image? recipe.image : "https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png"}
            />
            <div className={styles.recipeContent}>
                <p className={styles.recipeName}>{recipe.name}</p>
            </div>
        </div>
    )
}

export default RecipeCard;