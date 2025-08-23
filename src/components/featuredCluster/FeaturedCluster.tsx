import { Recipe } from '../../api/types/recipe';
import GlobalErrorDisplay from '../GlobalErrorDisplay';
import RecipeCardWithFeatures from '../recipeCardWithFeatures/RecipeCardWithFeatures';
import styles from './FeaturedCluster.module.css';

type FeaturedClusterProps = {
    title: string;
    hero: Recipe;
    companions: Recipe[];
    className?: string;
};

export default function FeaturedCluster({ title, hero, companions, className } : FeaturedClusterProps) {
    if (companions.length < 1) {
        const e = new Error();
        e.name = 'InvalidParameters';
        return <GlobalErrorDisplay error={e} message='Featured Cluster requires at least 1 recipe.' />
    }

    return (
        <div className={`${styles.featuredClusterWrapper} ${className}`}>
            <div className={styles.header}>
                <h2 
                    className={`section-title ${styles.title} underlined-title`}
                    style={{ "--category-color": "var(--color-brand-primary-light)" } as React.CSSProperties}
                >
                    {title}
                </h2>
            </div>
            <div className={styles.content}>
                <div className={styles.heroRecipe}>
                    <RecipeCardWithFeatures recipe={hero} size="rich" />
                </div>
                <div className={styles.companionRecipes}>
                    {companions.map(recipe => <RecipeCardWithFeatures recipe={recipe} size="lean" />)}
                </div>
            </div>
        </div>
    )
}