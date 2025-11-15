import { Link, useLoaderData, useNavigate, useRouteLoaderData } from 'react-router';
import styles from './browseCoreCategoryPage.module.css';
import { BrowseCoreCategoryLoaderResult } from './browseCoreCategoryLoader';
import GlobalErrorDisplay from '../../components/globalErrorDisplay/GlobalErrorDisplay';
import { useEffect, useMemo, useState } from 'react';
import BasicHero from '../../components/basicHero/BasicHero';
import FeaturedList from '../../components/featuredList/FeaturedList';
import FeaturedCluster from '../../components/featuredCluster/FeaturedCluster';
import { createAppError } from '../../utils/errors/factory';
import { AppErrorCodes } from '../../utils/errors/codes';
import { log } from '../../utils/logger';

export default function BrowseCoreCategoryPage() {
    const { categoryData } = useLoaderData() as BrowseCoreCategoryLoaderResult;
    const { categoryInfo, recipes } = categoryData;    

    const [error, setError] = useState<Error | null>(null);
    const navigate = useNavigate();
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

            <section className={`section ${styles.sectionCluster}`}>
                <div className={`container`}>
                    {subCategoryData[0].recipes.length > 0 &&
                        <FeaturedCluster 
                            key={subCategoryData[0].key}
                            title={subCategoryData[0].title}
                            hero={subCategoryData[0].recipes[0]} 
                            companions={subCategoryData[0].recipes.slice(1, 5)} 
                            className={styles.heroCluster}
                        />
                    }
                </div>
            </section>

            <section className={`section ${styles.sectionCategory}`}>
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

            <section className={`section ${styles.sectionCategory}`}>
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

            <section className={`section ${styles.sectionCluster}`}>
                <div className={`container`}>
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

            <section className={`section ${styles.sectionCategory}`}>
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

            {!!categoryInfo.relatedCategories && categoryInfo.relatedCategories.length > 1 && 
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
            }
        </div>
    )
}