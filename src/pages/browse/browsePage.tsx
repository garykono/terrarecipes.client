import clsx from 'clsx';
import { Link, useRouteLoaderData } from 'react-router';
import styles from './browsePage.module.css';
import { RootLoaderResult } from '../root/rootLoader';
import GlobalErrorDisplay from '../../components/globalErrorDisplay/GlobalErrorDisplay';
import { createAppError } from '../../utils/errors/factory';
import { AppErrorCodes } from '../../utils/errors/codes';

export default function BrowsePage() {
    const rootData = useRouteLoaderData('root') as RootLoaderResult;

    if (!rootData?.categories) {
        const e = createAppError({ 
            code: AppErrorCodes.MISSING_LOADER_DATA,
            message: 'Could not properly load required data: categories'
        });
        return <GlobalErrorDisplay error={e} />
    }
    const { categories } = rootData;

    return (
        <div className="account-page">
            <h2 className={`page-title ${styles.pageTitle}`}>Explore Recipes</h2>

            <section className={clsx(
                "section",
                styles.sectionStaticCategories
            )}>
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

            <section className={clsx(
                "section",
                styles.sectionFeaturedCategories
            )}>
                <div className="container">
                    <h2 className={clsx(
                        "section-title",
                        styles.categoriesTitle
                    )}>
                        Seasonal and Trending
                    </h2>
                    <div className={styles.featuredCategoriesContainer}>
                        <div className={styles.featuredCategoriesList}>
                            {categories.featured.map((category, index) => {
                                return (
                                    <Link to={`/browse/featured/${category.slug}`} key={index}>
                                        <div className={clsx(
                                            "card",
                                            styles.featuredCategoryCard
                                        )}>
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

