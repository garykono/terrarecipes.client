import styles from './RecipesPage.module.css';
import { useEffect } from 'react'
import { useLoaderData, useNavigate } from 'react-router-dom';
import SearchBar from '../../components/searchBar/SearchBar';
import RecipeCardWithFeatures from '../../components/recipeCardWithFeatures/RecipeCardWithFeatures';
import CardList from '../../components/cardList/CardList';
import Pagination from '../../components/pagination/Pagination';
import { RecipesLoaderResult } from './recipesLoader';
import BasicHero from '../../components/basicHero/BasicHero';

function RecipesPage() {
    const navigate = useNavigate();
    const { recipes, totalPages, page, search } = useLoaderData() as RecipesLoaderResult;
    const previousSearchTerm = search?.replace('-', ' ');

    return (
        <div className={styles.recipePage}>
            <div className="container">
                <div className={styles.recipes}>
                    <div className={`card ${styles.hero}`}>
                        <p className={`page-title ${styles.heroText}`}>🍓 What are you craving today?</p>
                        <div className={styles.searchForm}>
                            <SearchBar 
                                placeholder="Try ramen, dinner, onion…"
                                initialSearchTerm={previousSearchTerm} 
                                onSearch={searchTerm => navigate(`/recipes/1/${searchTerm}`)} 
                                size="large"
                            />
                        </div>
                    </div>
                    <section className={`${styles.results}`}>
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
                                onFirstPageButtonClicked={() => navigate(`/recipes/${1}/${search}`)}
                                onPreviousPageButtonClicked={() => navigate(`/recipes/${page - 1}/${search}`)} 
                                onNextPageButtonClicked={() => navigate(`/recipes/${page + 1}/${search}`)}
                                onLastPageButtonClicked={() => navigate(`/recipes/${totalPages}/${search}`)}
                                numPages={totalPages} 
                            />
                        }
                    </section>
                </div>
            </div>
        </div>
    )
}

export default RecipesPage;