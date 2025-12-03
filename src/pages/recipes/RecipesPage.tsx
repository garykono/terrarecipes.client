import clsx from 'clsx';
import { useLoaderData, useNavigate } from 'react-router-dom';
import styles from './RecipesPage.module.css';
import { RecipesLoaderResult } from './recipesLoader';
import SearchBar from '../../components/searchBar/SearchBar';
import RecipeCardWithFeatures from '../../components/recipeCardWithFeatures/RecipeCardWithFeatures';
import CardList from '../../components/cardList/CardList';
import Pagination from '../../components/pagination/Pagination';

export default function RecipesPage() {
    const navigate = useNavigate();
    const { recipes, totalPages, page, search } = useLoaderData() as RecipesLoaderResult;
    const previousSearchTerm = search;
    const searchSlug = search ? search : "";

    return (
        <div className={styles.recipePage}>
            <div className="container">
                <div className={styles.recipes}>
                    <div className={clsx(
                        "card",
                        styles.hero
                    )}>
                        <p className={clsx(
                            "page-title",
                            styles.heroText
                        )}>
                            🍓 What are you craving today?
                        </p>
                        <div className={styles.searchForm}>
                            <SearchBar 
                                placeholder="Try ramen, dinner, onion…"
                                initialSearchTerm={previousSearchTerm} 
                                onSearch={searchTerm => navigate(`/recipes/1/${searchTerm}`)} 
                                size="large"
                            />
                        </div>
                    </div>
                    <section className={styles.results}>
                        <p className={styles.resultsText}>
                                {recipes.length > 0
                                    ? search && `Showing results for "${previousSearchTerm}".`
                                    : `No results were found for "${previousSearchTerm}".`
                                }
                            </p>
                        <CardList
                            list={
                                recipes.map(recipe => {
                                    return <RecipeCardWithFeatures key={recipe._id} recipe={recipe} />;
                                })}
                            className={styles.cardList}
                        />
                        {recipes.length > 0 &&
                            <Pagination 
                                currentPage={page} 
                                onFirstPageButtonClicked={() => navigate(`/recipes/${1}/${searchSlug}`)}
                                onPreviousPageButtonClicked={() => navigate(`/recipes/${page - 1}/${searchSlug}`)} 
                                onNextPageButtonClicked={() => navigate(`/recipes/${page + 1}/${searchSlug}`)}
                                onLastPageButtonClicked={() => navigate(`/recipes/${totalPages}/${searchSlug}`)}
                                numPages={totalPages} 
                            />
                        }
                    </section>
                </div>
            </div>
        </div>
    )
}