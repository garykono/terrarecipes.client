import clsx from 'clsx';
import styles from './FeaturedCluster.module.css';
import { Recipe } from '../../api/types/recipe';
import RecipeCardWithFeatures from '../recipeCardWithFeatures/RecipeCardWithFeatures';

type FeaturedClusterProps = {
    title?: string;
    hero: Recipe;
    companions: Recipe[];
    className?: string;
};

export default function FeaturedCluster({ title, hero, companions, className } : FeaturedClusterProps) {
    return (
        <div className={clsx(
            styles.featuredClusterWrapper,
            className
        )}>
            {title &&
                <div className={styles.header}>
                    <h2 
                        className={clsx(
                            "section-title",
                            styles.title,
                            "underlined-title"
                        )}
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
                    <div className={clsx(
                        styles.companionRecipes,
                        companions.length < 3 ? styles.companionRecipesSingleRow : ""
                    )}>
                        {companions.slice(0, 4).map((recipe, index) => (
                            <RecipeCardWithFeatures 
                                key={index} 
                                recipe={recipe} 
                                size="lean" 
                                className={clsx(companions.length < 3 && styles.shortCompanion)}
                            />
                        ))}
                    </div>
                </div>
                : <div className="text">There are no recipes for this category yet!</div>
            }
        </div>
    )
}