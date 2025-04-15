import { ReactNode, useState } from 'react'
import { Link } from 'react-router-dom';
import classNames from 'classnames'
import RecipeCardWithFeatures from './RecipeCardWithFeatures';
import { Recipe } from '../api/types/recipe';

interface FeaturedListProps {
    title: string;
    featuredList: Recipe[];
    buttonTitle: string;
}

export default function FeaturedList({ title, featuredList, buttonTitle }: FeaturedListProps) {
    let renderedRecipes: ReactNode[] = [];
    if (featuredList) {
        renderedRecipes = featuredList.map((recipe, index) => {
            return (
                <div className="column is-one-quarter" key={index}>
                    <RecipeCardWithFeatures recipe={recipe} key={recipe._id} />
                </div>
            );
        })
    }

    return (
        <div className={classNames("")}>
            <h3 className="is-size-4 has-text-weight-bold mb-5" style={{textAlign: 'center'}}>{title}</h3>
            <div className="columns is-centered is-multiline">
                {renderedRecipes}
            </div>
            <div className="is-flex is-justify-content-center pt-2">
                <button className="button my-color-bg">{buttonTitle}</button>
            </div>
        </div>
    );
}