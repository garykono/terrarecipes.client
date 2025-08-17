import styles from './FeaturedList.module.css';
import { ReactElement, useState } from 'react'
import { Link } from 'react-router-dom';
import classNames from 'classnames'
import RecipeCardWithFeatures from '../recipeCardWithFeatures/RecipeCardWithFeatures';
import { Recipe } from '../../api/types/recipe';
import CardList from '../cardList/CardList';
import GlobalErrorDisplay from '../GlobalErrorDisplay';
import Button from '../buttons/Button';
import RecipeCard from '../recipeCard/RecipeCard';

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
        e.name = 'MissingParameters';
        return <GlobalErrorDisplay error={e} message='No onClick function passed for More Recipes button' />
    }

    return (
        <div className={`${styles.featuredList} ${className || ""}`}>
            <div className={styles.header}>
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