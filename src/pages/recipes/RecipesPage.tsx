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
            <BasicHero title='Recipes' text='Browse all our recipes.' />

            <div className="container">
                <div className={styles.recipes}>
                    <div className={styles.search}>
                        <div className={styles.searchForm}>
                            <SearchBar 
                                placeholder='ex. "beef stew", "dinner"'
                                initialSearchTerm={previousSearchTerm} 
                                onSearch={searchTerm => navigate(`/recipes/1/${searchTerm}`)} 
                            />
                        </div>
                        <p className={styles.resultsText}>{search && `Showing results for "${previousSearchTerm}".`}</p>
                    </div>
                    <CardList
                        list={
                            recipes.map(recipe => {
                                return <RecipeCardWithFeatures key={recipe._id} recipe={recipe} />;
                            })}
                        className={styles.cardList}
                    />
                    <Pagination 
                        currentPage={page} 
                        onFirstPageButtonClicked={() => navigate(`/recipes/${1}`)}
                        onPreviousPageButtonClicked={() => navigate(`/recipes/${page - 1}`)} 
                        onNextPageButtonClicked={() => navigate(`/recipes/${page + 1}`)}
                        onLastPageButtonClicked={() => navigate(`/recipes/${totalPages}`)}
                        numPages={totalPages} 
                    />
                </div>
            </div>
        </div>
    )
}

export default RecipesPage;