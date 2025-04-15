import { useEffect } from 'react'
import { useLoaderData, useNavigate } from 'react-router-dom';
import SearchBar from '../../components/SearchBar';
import RecipeCardWithFeatures from '../../components/RecipeCardWithFeatures';
import CardList from '../../components/CardList';
import Pagination from '../../components/Pagination';
import { RecipesLoaderResult } from './recipesLoader';

function RecipesPage() {
    const navigate = useNavigate();
    const { recipes, totalPages, page, search, numCols } = useLoaderData() as RecipesLoaderResult;

    const renderedRecipeCards = recipes.map(recipe => {
        return <RecipeCardWithFeatures key={recipe._id} recipe={recipe} />;
    })

    return (
        <div className="my-color-page-bg">
            <section className="hero is-small my-color-bg">
                <div className="hero-body">
                    <p className="title my-color-bg">Recipes</p>
                </div>
            </section>
            <section className="section">
                <div className="column is-half is-flex is-align-items-center">
                    <SearchBar initialSearchTerm={search} onSearch={searchTerm => navigate(`/recipes/1/${searchTerm}`)} />
                </div>
                <CardList list={renderedRecipeCards} numCols={numCols} />
                <Pagination 
                    currentPage={page} 
                    onFirstPageButtonClicked={() => navigate(`/recipes/${1}`)}
                    onPreviousPageButtonClicked={() => navigate(`/recipes/${page - 1}`)} 
                    onNextPageButtonClicked={() => navigate(`/recipes/${page + 1}`)}
                    onLastPageButtonClicked={() => navigate(`/recipes/${totalPages}`)}
                    numPages={totalPages} 
                />
            </section>
        </div>
    )
}

export default RecipesPage;