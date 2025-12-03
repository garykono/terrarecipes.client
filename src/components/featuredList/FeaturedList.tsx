import styles from './FeaturedList.module.css';
import RecipeCardWithFeatures from '../recipeCardWithFeatures/RecipeCardWithFeatures';
import { Recipe } from '../../api/types/recipe';
import GlobalErrorDisplay from '../globalErrorDisplay/GlobalErrorDisplay';
import Button from '../buttons/Button';

interface FeaturedListProps {
    title: string;
    featuredList: Recipe[];
    moreButton?: boolean;
    buttonTitle?: string;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    className?: string;
    
}

export default function FeaturedList({ 
    title, 
    featuredList = [], 
    moreButton = true,
    buttonTitle = "More Recipes", 
    onClick, 
    className 
}: FeaturedListProps) {
    if (moreButton && !onClick) {
        const e = new Error();
        e.name = 'Missing_Parameters';
        return <GlobalErrorDisplay error={e} message='No onClick function passed for More Recipes button' />
    }

    return (
        <div className={`${styles.featuredList} ${className || ""}`}>
            <div 
                className={`${styles.header} underlined-title`}
                style={{ "--category-color": "var(--color-brand-primary-light)" } as React.CSSProperties}
            >
                <h2 className={`section-title ${styles.title}`}>{title}</h2>
                {moreButton &&
                    <Button onClick={ onClick }>{buttonTitle}</Button>
                }
            </div>

            {featuredList.length > 0
                ? <div className={styles.scrollWrapper}>
                        {featuredList.map((recipe) => (
                            <div key={recipe._id} className={styles.cardWrapper}>
                                <RecipeCardWithFeatures recipe={recipe} />
                            </div>
                        ))}
                </div>
                : <div className="text">There are no recipes for this category yet!</div>
            }
        </div>
    );
}