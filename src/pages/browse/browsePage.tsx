import { Link, useNavigate, useRouteLoaderData } from 'react-router';
import styles from './browsePage.module.css';
import { useEffect, useState } from 'react';
import GlobalErrorDisplay from '../../components/GlobalErrorDisplay';
import BasicHero from '../../components/basicHero/BasicHero';
import { RootLoaderResult } from '../root/rootLoader';
import FeaturedList from '../../components/featuredList/FeaturedList';
import { Category } from '../../api/types/standardized';
import { fetchRecipes } from '../../api/queries/recipesApi';
import { Recipe } from '../../api/types/recipe';
import FeaturedRecipe from '../../components/featuredRecipe/FeaturedRecipe';

export default function BrowsePage() {
    const navigate = useNavigate();
    const rootData = useRouteLoaderData('root') as RootLoaderResult;

    if (!rootData?.categories) {
        const e = new Error();
        e.name = 'MissingLoaderData';
        return <GlobalErrorDisplay error={e} />
    }

    const { categories } = rootData;
    const [error, setError] = useState<Error | null>(null);
    const [featuredData, setFeaturedData] = useState<Record<string, Recipe[]>>({});
    const [featuredRecipe, setFeaturedRecipe] = useState<Recipe>();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!categories?.featured) return;

        let cancelled = false;

        async function loadFeatured() {
            try {
                setLoading(true);

                const results: Record<string, Recipe[]> = {};
                let featuredRec = null;
                for (const category of categories.featured) {
                    try {
                        const data = await fetchRecipes({ search: category.searchTags[0] });
                        results[category.slug] = data.data.slice(0, 10) ?? [];
                        // Just grabbing a placeholder recipe for now
                        if (!featuredRec && results[category.slug].length > 0) featuredRec = results[category.slug][0];
                    } catch (err) {
                        console.error(`Error loading ${category.title}`, err);
                        results[category.slug] = [];
                    }
                }

                if (!cancelled) {
                    setFeaturedData(results);
                    if (featuredRec) {
                        setFeaturedRecipe(featuredRec)
                    }
                    setLoading(false);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err as Error);
                    setLoading(false);
                }
            }
        }

        loadFeatured();
        return () => { cancelled = true; };
    }, [categories]);

    if (error) {
        return <GlobalErrorDisplay error={error} />;
    }

    return (
        <div className="account-page">
            <BasicHero title="Browse" />

            <section className={`section ${styles.sectionStaticCategories}`}>
                <div className="container">
                    <ul className={styles.staticCategoryList}>
                        {categories.core.map(category => {
                            return (
                                <li key={category.title} className={styles.categoryItem}>
                                    <Link to={`/browse/core/${category.slug}`} className={styles.categoryLink}>
                                        <div className={styles.categoryIcon}>
                                            {category.icon}
                                        </div>
                                        <div className={styles.categoryTitle}>
                                            {category.title}
                                        </div>
                                    </Link>
                                </li>
                            )
                        })}
                    </ul>
                </div>
            </section>

            {featuredRecipe &&
                <section className={`section ${styles.sectionStaticCategories}`}>
                    <div className="container">
                        <FeaturedRecipe recipe={featuredRecipe} />
                    </div>
                </section>
            }

            <section className={`section ${styles.sectionFeaturedCategories}`}>
                <div className="container">
                    <div className={styles.featuredLists}>
                        {categories.featured.map(category => (
                            <FeaturedList
                                key={category.slug}
                                title={category.title}
                                featuredList={featuredData[category.slug]}
                                buttonTitle={`More ${category.slug} recipes`}
                                onClick={() => navigate(`/recipes/1/${category.searchTags[0]}`)}
                                className={styles.featuredList}
                            />
                        ))}
                    </div>
                </div>
            </section>
        </div>
    )
}

