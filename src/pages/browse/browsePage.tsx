import { Link, useNavigate, useRouteLoaderData } from 'react-router';
import styles from './browsePage.module.css';
import { useEffect, useState } from 'react';
import GlobalErrorDisplay from '../../components/globalErrorDisplay/GlobalErrorDisplay';
import { RootLoaderResult } from '../root/rootLoader';

export default function BrowsePage() {
    const navigate = useNavigate();
    const rootData = useRouteLoaderData('root') as RootLoaderResult;

    if (!rootData?.categories) {
        console.log(rootData)
        const e = new Error();
        e.name = 'MissingLoaderData';
        return <GlobalErrorDisplay error={e} />
    }

    const { categories } = rootData;
    const [error, setError] = useState<Error | null>(null);
    // const [featuredData, setFeaturedData] = useState<Record<string, Recipe[]>>({});
    // const [featuredRecipe, setFeaturedRecipe] = useState<Recipe>();
    // const [loading, setLoading] = useState(true);

    // useEffect(() => {
    //     if (!categories?.featured) return;

    //     let cancelled = false;

    //     async function loadFeatured() {
    //         try {
    //             setLoading(true);

    //             const results: Record<string, Recipe[]> = {};
    //             let featuredRec = null;
    //             for (const category of categories.featured) {
    //                 try {
    //                     const data = await fetchRecipes({ search: category.searchTags[0] });
    //                     results[category.slug] = data.data.slice(0, 10) ?? [];
    //                     // Just grabbing a placeholder recipe for now
    //                     if (!featuredRec && results[category.slug].length > 0) featuredRec = results[category.slug][0];
    //                 } catch (err) {
    //                     console.error(`Error loading ${category.title}`, err);
    //                     results[category.slug] = [];
    //                 }
    //             }

    //             if (!cancelled) {
    //                 setFeaturedData(results);
    //                 if (featuredRec) {
    //                     setFeaturedRecipe(featuredRec)
    //                 }
    //                 setLoading(false);
    //             }
    //         } catch (err) {
    //             if (!cancelled) {
    //                 setError(err as Error);
    //                 setLoading(false);
    //             }
    //         }
    //     }

    //     loadFeatured();
    //     return () => { cancelled = true; };
    // }, [categories]);

    if (error) {
        return <GlobalErrorDisplay error={error} />;
    }

    return (
        <div className="account-page">
            <h2 className={`page-title ${styles.pageTitle}`}>Explore Recipes</h2>

            <section className={`section ${styles.sectionStaticCategories}`}>
                <div className="container">
                    <ul className={styles.staticCategoryList}>
                        {categories.core.map(category => {
                            return (
                                <li key={category.title} className={styles.categoryItem}>
                                    <Link to={`/browse/core/${category.slug}`} className={styles.categoryLink}>
                                        <span className={styles.categoryIcon}>
                                            {category.icon}
                                        </span>
                                        <span className={styles.categoryTitle}>
                                            {category.title}
                                        </span>
                                    </Link>
                                </li>
                            )
                        })}
                    </ul>
                </div>
            </section>

            <section className={`section ${styles.sectionFeaturedCategories}`}>
                <div className="container">
                    <h2 className={`section-title ${styles.categoriesTitle}`}>Seasonal and Trending</h2>
                    <div className={styles.featuredCategoriesContainer}>
                        <div className={styles.featuredCategoriesList}>
                            {categories.featured.map((category, index) => {
                                return (
                                    <Link to={`/browse/featured/${category.slug}`} key={index}>
                                        <div className={`card ${styles.featuredCategoryCard}`}>
                                            <span className={styles.featuredIconCircle}>
                                                <span className={styles.featuredCategoryIcon}>
                                                    {category.icon}
                                                </span>
                                            </span>
                                            <span className={styles.featuredCategoryTitle}>
                                                {category.title}
                                            </span>
                                        </div>
                                    </Link>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

