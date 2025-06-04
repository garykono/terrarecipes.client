import styles from './FeaturedList.module.css';
import { ReactElement, useState } from 'react'
import { Link } from 'react-router-dom';
import classNames from 'classnames'
import RecipeCardWithFeatures from '../recipeCardWithFeatures/RecipeCardWithFeatures';
import { Recipe } from '../../api/types/recipe';
import CardList from '../cardList/CardList';

interface FeaturedListProps {
    title: string;
    featuredList: Recipe[];
    buttonTitle: string;
    onClick: React.MouseEventHandler<HTMLButtonElement>;
    className?: string;
    
}

export default function FeaturedList({ title, featuredList, buttonTitle, onClick, className }: FeaturedListProps) {
    let renderedRecipes: ReactElement[] = [];
    if (featuredList) {
        renderedRecipes = featuredList.map((recipe, index) => {
            return <RecipeCardWithFeatures recipe={recipe} key={recipe._id} />;
        })
    }

    return (
        <div className={`${styles.featuredList} ${className}`}>
            <h2 className={`${styles.title} heading-tertiary`}>{title}</h2>
            <CardList 
                list={renderedRecipes}   
                className={styles.cardList}         
            />
            <div className={styles.moreButton}>
                <button className="button button--full" onClick={onClick}>{buttonTitle}</button>
            </div>
        </div>
    );
}