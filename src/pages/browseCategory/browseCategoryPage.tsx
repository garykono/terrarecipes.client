import { Link, useLoaderData, useNavigate, useRouteLoaderData } from 'react-router';
import styles from './browseCategoryPage.module.css';
import { BrowseCategoryLoaderResult } from './browseCategoryLoader';
import GlobalErrorDisplay from '../../components/GlobalErrorDisplay';
import { RootLoaderResult } from '../root/rootLoader';
import { useEffect, useMemo, useState } from 'react';
import BasicHero from '../../components/basicHero/BasicHero';
import CardList from '../../components/cardList/CardList';
import RecipeCardWithFeatures from '../../components/recipeCardWithFeatures/RecipeCardWithFeatures';
import FeaturedList from '../../components/featuredList/FeaturedList';
import { CategoryData } from '../../api/types/category';
import { Recipe } from '../../api/types/recipe';
import FeaturedRecipe from '../../components/featuredRecipe/FeaturedRecipe';

export default function BrowseCategoryPage() {
    const { categoryData } = useLoaderData() as BrowseCategoryLoaderResult;
    console.log(categoryData)
    const { categoryInfo, recipes } = categoryData;    

    const [error, setError] = useState<Error | null>(null);
    const navigate = useNavigate();
    // const [featuredData, setFeaturedData] = useState<Record<string, Recipe[]>>({});
    // const [loading, setLoading] = useState(true);
    
    const subCategoryRecipes = useMemo(() => {
        return groupRecipesBySubcategory(categoryData)
    }, [categoryInfo, recipes]);

    const renderedSubCategoryLists = useMemo(() => {
        return Object.entries(subCategoryRecipes).map(([key, subCategoryRecipeList]) => (
            <FeaturedList
                key={key}
                title={categoryInfo.subCategories[key].title}
                featuredList={subCategoryRecipeList}
                moreButton={false}
            />
        ))
    }, [subCategoryRecipes]);
    
    if (!categoryData) {
        const e = new Error();
        e.name = 'MissingLoaderData';
        return <GlobalErrorDisplay error={e} />
    }

    if (error) {
        return <GlobalErrorDisplay error={error} />;
    }

    return (
        <div className="browse-category-page">
            <BasicHero title={`${categoryInfo.title}`} text={categoryInfo.description} />

            <section className={`section ${styles.sectionCategory}`}>
                <div className="container">
                    {renderedSubCategoryLists[0]}
                </div>
            </section>

            {recipes[0] &&
                <section className={`section ${styles.sectionCategory}`}>
                    <div className="container">
                        <FeaturedRecipe recipe={recipes[0]}/>
                    </div>
                </section>
                }

            <section className={`section ${styles.sectionCategory}`}>
                <div className="container">
                    {renderedSubCategoryLists[1]}
                </div>
            </section>

            <section className={`section ${styles.sectionCategory}`}>
                <div className="container">
                    {renderedSubCategoryLists[2]}
                </div>
            </section>

            <section className={`section ${styles.sectionRecipeGrid}`}>
                <div className="container">
                    <div className={styles.sectionRecipeGridContent}>
                        <h2 className='heading-secondary'>{`All ${categoryInfo.title} Recipes`}</h2>
                        <CardList
                            list={
                                recipes.map(recipe => {
                                    return <RecipeCardWithFeatures key={recipe._id} recipe={recipe} />;
                                })}
                            className={styles.cardList}
                        />
                    </div>
                </div>
            </section>

            <section className={`section ${styles.sectionRelatedRecipes}`}>
                <div className="container">
                    <div className={styles.sectionRelatedRecipesContent}>
                        <h2 className='heading-secondary'>{`Related Recipes`}</h2>
                        <div className={styles.relatedRecipesOptions}>
                            {categoryInfo.relatedCategories.map(relatedCategoryName => (
                                    <Link
                                        to={`/recipes/1/${relatedCategoryName}`}
                                        className={`${styles.relatedRecipesLink}`}
                                        key={relatedCategoryName}
                                    > 
                                        {relatedCategoryName}
                                    </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

function groupRecipesBySubcategory(categoryData: CategoryData) {
    const { subCategories } = categoryData.categoryInfo;
    const { recipes } = categoryData;

    const grouped: Record<string, Recipe[]> = {};

    Object.entries(subCategories).forEach(([subKey, subInfo]) => {
        const searchTags = (subInfo.searchCriteria?.tags || [])
            .map(tag => tag.trim().toLowerCase()); // normalize search tags

        grouped[subKey] = recipes.filter(recipe =>
            recipe.tags.some(tag => searchTags.includes(tag.trim().toLowerCase())) // normalize recipe tags
        );
    });

    return grouped;
}