import clsx from 'clsx';
import { Link, useLoaderData } from 'react-router';
import styles from './browseFeaturedCategoryPage.module.css';
import { BrowseFeaturedCategoryLoaderResult } from './browseFeaturedCategoryLoader';
import GlobalErrorDisplay from '../../components/globalErrorDisplay/GlobalErrorDisplay';
import { useMemo, useState } from 'react';
import BasicHero from '../../components/basicHero/BasicHero';
import FeaturedCluster from '../../components/featuredCluster/FeaturedCluster';
import RecipeTileList from '../../components/recipeTileList/RecipeTileList';
import { createAppError } from '../../utils/errors/factory';
import { AppErrorCodes } from '../../utils/errors/codes';
import { log } from '../../utils/logger';

export default function BrowseFeaturedCategoryPage() {
    const { categoryData } = useLoaderData() as BrowseFeaturedCategoryLoaderResult;
    const { categoryInfo, recipes } = categoryData;    

    const [error, setError] = useState<Error | null>(null);
    // const [featuredData, setFeaturedData] = useState<Record<string, Recipe[]>>({});
    // const [loading, setLoading] = useState(true);

    const subCategoryData = useMemo(() => {
        if (categoryInfo.subCategories) {
            const subCategories = categoryInfo.subCategories;
            
            return Object.entries(subCategories).map(([key, subCategoryInfo]) => {
                return {
                    key,
                    title: subCategoryInfo.title,
                    recipes: recipes[key].results
                };
            })
        } else {
            return [{
                key: categoryInfo.slug,
                title: categoryInfo.title,
                recipes: recipes[categoryInfo.slug].results
            }]
        }
    }, [categoryInfo, recipes]);
    
    if (!categoryData) { 
        log.warn("Page couldn't load because no category data")
        return <GlobalErrorDisplay error={createAppError({ code: AppErrorCodes.MISSING_LOADER_DATA })} /> 
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
                            hero={subCategoryData[0].recipes[0]} 
                            companions={subCategoryData[0].recipes.slice(1, 5)} 
                            className={styles.heroCluster}
                        />
                    }
                </div>
            </section>

            {subCategoryData[0].recipes.length > 5 &&
                <section className={clsx(
                    "section",
                    styles.sectionRecipeTiles
                )}>
                    <div className={"container"}>
                        <div className={styles.recipeTileList}>
                            <h2 className="section-title">{`More ${categoryInfo.title}`}</h2>
                            <RecipeTileList
                                list={subCategoryData[0].recipes.slice(5)}
                                className={styles.cardList}
                            />
                        </div>
                    </div>
                </section>
            }

            {!!categoryInfo.relatedCategories && categoryInfo.relatedCategories.length > 1 && 
                <section className={clsx(
                    "section",
                    styles.sectionRelatedRecipes
                )}>
                    <div className="container">
                        <div className={styles.sectionRelatedRecipesContent}>
                            <h2 className="heading-secondary">{`Related Recipes`}</h2>
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
            }
        </div>
    )
}