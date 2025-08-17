import recipeCardStyles from './RecipeCard.module.css';
import leanStyles from './RecipeCardLean.module.css';
import richStyles from './RecipeCardRich.module.css';
import { RecipeWithMarkForDelete } from "../../api/types/recipe";

interface RecipeCardProps {
    recipe: RecipeWithMarkForDelete;
    size?: 'lean' | 'rich';
    className?: string;
}

export default function RecipeCard({ recipe, size = 'lean', className }: RecipeCardProps) {
    return (
        <div className={`card recipeCard ${size === 'lean' ? leanStyles.recipeCard : richStyles.recipeCard } ${className}`}>
            <img 
                className={`${recipeCardStyles.img} ${size === 'rich' && richStyles.img}`}
                style={recipe.markForDelete? { opacity: 0.5 } : {}}
                src={recipe.image? recipe.image : "https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png"}
            />
            <div className={`${recipeCardStyles.recipeContent} ${size === 'rich' && richStyles.recipeContent}`}>
                <p className={`${recipeCardStyles.recipeName} ${size === 'lean' ? leanStyles.recipeName : richStyles.recipeName}`}>{recipe.name}</p>
                {size === 'rich' && 
                    <div className={richStyles.info}>
                        <p className={recipeCardStyles.category}>
                            <span className={recipeCardStyles.categoryIcon}>🍲</span>
                            <span className={recipeCardStyles.categoryText}>{" Dinner"}</span>
                        </p>
                        <p className={`${richStyles.recipeDescription}`}>{recipe.description}</p>
                    </div>
                }
                <ul className={`${recipeCardStyles.metaDataRow} ${size === 'rich' && richStyles.metaDivide}`}>
                    <li className="text-meta"><span>⭐ 4.8</span></li>
                    <li className="text-meta"><span>⏱ 35 min</span></li>
                    {/* if more attributes causes this row to take 2 lines, make small adjustments like text size to 12px, shorter labels, etc.
                    <li className="text-meta"><span>🔥 Medium</span></li> */}
                </ul>
            </div>
        </div>
    )
}