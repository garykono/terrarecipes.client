import clsx from 'clsx';
import { useMemo, useState } from 'react';
import { Link, useLoaderData } from 'react-router';
import styles from './browseCoreCategoryPage.module.css';
import { BrowseCoreCategoryLoaderResult } from './browseCoreCategoryLoader';
import GlobalErrorDisplay from '../../components/globalErrorDisplay/GlobalErrorDisplay';
import BasicHero from '../../components/basicHero/BasicHero';
import FeaturedList from '../../components/featuredList/FeaturedList';
import FeaturedCluster from '../../components/featuredCluster/FeaturedCluster';
import { createAppError } from '../../utils/errors/factory';
import { AppErrorCodes } from '../../utils/errors/codes';
import { log } from '../../utils/logger';
import { Recipe } from '../../api/types/recipe';
import { relatedRouteMap } from '../../routes/relatedRouteMap';

const MAX_RECIPES_TO_DISPLAY = 5;

export default function BrowseCoreCategoryPage() {
    const { categoryData } = useLoaderData() as BrowseCoreCategoryLoaderResult;
    const { categoryInfo, recipes } = categoryData;    

    const [error, setError] = useState<Error | null>(null);

    const subCategoryData = useMemo(() => {
        if (categoryInfo.subCategories) {
            const subCategories = categoryInfo.subCategories;

            // Keep a counter of how many times each recipes shows up
            const recipeIdsCounter = {} as Record<string, number>;
            
            return Object.entries(subCategories).map(([key, subCategoryInfo]) => {
                const subCategoryRecipesToDisplay = [] as Recipe[];

                // Increment the counter for each recipe we're using
                for (const recipe of recipes[key].results) {
                    if (recipeIdsCounter[recipe.id]) {
                        recipeIdsCounter[recipe.id] += 1;
                    } else {
                        recipeIdsCounter[recipe.id] = 1;
                    }

                    // If the recipe hasn't shown up more than once already on other lists, display it in this list
                    if (recipeIdsCounter[recipe.id] < 2) subCategoryRecipesToDisplay.push(recipe);
                    // Stop at 5 recipes
                    if (subCategoryRecipesToDisplay.length >= MAX_RECIPES_TO_DISPLAY) break;
                };
                
                return {
                    key,
                    title: subCategoryInfo.title,
                    recipes: subCategoryRecipesToDisplay
                };
            })
        } else {
            // Fallback on all recipes for the category itself
            return [{
                key: categoryInfo.slug,
                title: categoryInfo.title,
                recipes: recipes[categoryInfo.slug].results
            }]
        }
    }, [categoryInfo, recipes]);
    
    if (!categoryData) {
        log.error("Category data was missing, couldn't load page.")
        return <GlobalErrorDisplay error={createAppError({ code: AppErrorCodes.MISSING_LOADER_DATA })} />;
    }
    if (error) {
        return <GlobalErrorDisplay error={error} />;
    }

    return (
        <div className="browse-category-page">
            <div className="section">
                <BasicHero title={`${categoryInfo.title}`} text={categoryInfo.description} />
            </div>

            <section className={clsx(
                "section",
                styles.sectionCluster
            )}>
                <div className={"container"}>
                    {subCategoryData[0].recipes.length > 0 &&
                        <FeaturedCluster 
                            key={subCategoryData[0].key}
                            title={subCategoryData[0].title}
                            hero={subCategoryData[0].recipes[0]} 
                            companions={subCategoryData[0].recipes.slice(1, MAX_RECIPES_TO_DISPLAY)} 
                            className={styles.heroCluster}
                        />
                    }
                </div>
            </section>

            <section className={clsx(
                "section",
                styles.sectionCategory
            )}>
                <div className="container">
                    {subCategoryData.length > 1 && subCategoryData[1].recipes.length > 0 &&
                        <FeaturedList
                            key={subCategoryData[1].key}
                            title={subCategoryData[1].title}
                            featuredList={subCategoryData[1].recipes}
                            moreButton={false}
                        />
                    }
                </div>
            </section>

            <section className={clsx(
                "section",
                styles.sectionCategory
            )}>
                <div className="container">
                    {subCategoryData.length > 1 && subCategoryData[2].recipes.length > 0 &&
                        <FeaturedList
                            key={subCategoryData[2].key}
                            title={subCategoryData[2].title}
                            featuredList={subCategoryData[2].recipes}
                            moreButton={false}
                        />
                    }
                </div>
            </section>

            <section className={clsx(
                "section",
                styles.sectionCluster
            )}>
                <div className={"container"}>
                    {subCategoryData.length > 1 && subCategoryData[3].recipes.length > 0 &&
                        <FeaturedCluster 
                            key={subCategoryData[3].key}
                            title={subCategoryData[3].title}
                            hero={subCategoryData[3].recipes[0]} 
                            companions={subCategoryData[3].recipes.slice(1, 5)} 
                            className={styles.heroCluster}
                        />
                    }
                </div>
            </section>

            <section className={clsx(
                "section",
                styles.sectionCategory
            )}>
                <div className="container">
                    {subCategoryData.length > 1 && subCategoryData[4].recipes.length > 0 &&
                        <FeaturedList
                            key={subCategoryData[4].key}
                            title={subCategoryData[4].title}
                            featuredList={subCategoryData[4].recipes}
                            moreButton={false}
                        />
                    }
                </div>
            </section>

            {/* {!!categoryInfo.relatedCategories && categoryInfo.relatedCategories.length > 1 && 
                <section className={clsx(
                    "section",
                    styles.sectionRelatedRecipes
                )}>
                    <div className="container">
                        <div className={styles.sectionRelatedRecipesContent}>
                            <h2 className="heading-secondary">{`Related Recipes`}</h2>
                            <div className={styles.relatedRecipesOptions}>
                                {categoryInfo.relatedCategories.map(relatedCategoryName => {
                                    const relatedUrl = relatedRouteMap[relatedCategoryName]
                                        ? relatedRouteMap[relatedCategoryName]
                                        : `/recipes/1/${relatedCategoryName}`;
                                    return <Link
                                            to={relatedUrl}
                                            className={styles.relatedRecipesLink}
                                            key={relatedCategoryName}
                                        > 
                                            {relatedCategoryName}
                                        </Link>
                                })}
                            </div>
                        </div>
                    </div>
                </section>
            } */}
        </div>
    )
}