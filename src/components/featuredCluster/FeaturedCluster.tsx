import { Recipe } from '../../api/types/recipe';
import RecipeCardWithFeatures from '../recipeCardWithFeatures/RecipeCardWithFeatures';
import styles from './FeaturedCluster.module.css';

type FeaturedClusterProps = {
    title?: string;
    hero: Recipe;
    companions: Recipe[];
    className?: string;
};

export default function FeaturedCluster({ title, hero, companions, className } : FeaturedClusterProps) {
    return (
        <div className={`${styles.featuredClusterWrapper} ${className}`}>
            {title &&
                <div className={styles.header}>
                    <h2 
                        className={`section-title ${styles.title} underlined-title`}
                        style={{ "--category-color": "var(--color-brand-primary-light)" } as React.CSSProperties}
                    >
                        {title}
                    </h2>
                </div>
            }

            {!!hero
                ? <div className={styles.content}>
                    <div className={styles.heroRecipe}>
                        <RecipeCardWithFeatures recipe={hero} size="rich" />
                    </div>
                    <div className={`${styles.companionRecipes} ${companions.length < 3 ? styles.companionRecipesSingleRow : ""}`}>
                        {companions.slice(0, 4).map((recipe, index) => (
                            <RecipeCardWithFeatures 
                                key={index} 
                                recipe={recipe} 
                                size="lean" 
                                className={companions.length < 3 ? styles.shortCompanion : ""}
                            />
                        ))}
                    </div>
                </div>
                : <div className="text">There are no recipes for this category yet!</div>
            }
        </div>
    )
}