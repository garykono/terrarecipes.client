import clsx from 'clsx';
import styles from './FeaturedList.module.css';
import { Recipe } from '../../api/types/recipe';
import RecipeCardWithFeatures from '../recipeCardWithFeatures/RecipeCardWithFeatures';
import GlobalErrorDisplay from '../globalErrorDisplay/GlobalErrorDisplay';
import Button from '../buttons/Button';

interface FeaturedListProps {
    title: string;
    description?: string;
    featuredList: Recipe[];
    moreButton?: boolean;
    buttonTitle?: string;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    className?: string;
    
}

export default function FeaturedList({ 
    title, 
    description,
    featuredList = [], 
    moreButton = false,
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
        <div className={clsx(
            styles.featuredList,
            className
        )}>
            <div 
                className={clsx(
                    styles.header,
                    "underlined-title"
                )}
                style={{ "--category-color": "var(--color-brand-primary-light)" } as React.CSSProperties}
            >
                <div className={styles.textHeading}>
                    <h2 className={`section-title ${styles.title}`}>{title}</h2>
                    <p className={clsx("text", styles.description)}>{description}</p>
                </div>

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