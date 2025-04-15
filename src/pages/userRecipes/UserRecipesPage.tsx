import { useState, useEffect, useContext } from 'react'
import { useNavigate, Link, useRouteLoaderData, useLoaderData } from 'react-router-dom';
import SearchBar from "../../components/SearchBar";
import RecipeCardWithFeatures from '../../components/RecipeCardWithFeatures';
import CardList from '../../components/CardList';
import Pagination from '../../components/Pagination';
import FormError from '../../components/FormMessage';
import GlobalErrorDisplay from '../../components/GlobalErrorDisplay';
import { RootLoaderResult } from '../root/rootLoader';
import { Recipe } from '../../api/types/recipe';

function UserRecipesPage() {
    const navigate = useNavigate();
    const { user } = useRouteLoaderData('root') as RootLoaderResult;
    const { search } = useLoaderData();
    const { page, numCols, numRows } = useLoaderData();
    const [ recipesToShow, setRecipesToShow ] = useState<Recipe[]>([]);
    const [ totalPages, setTotalPages ] = useState(1);

    const [showAddRecipeButton, setShowAddRecipeButton] = useState(false);
    const [ deletedRecipeName, setDeletedRecipeName ] = useState('');
    const [ error, setError ] = useState(null);

    // Show button to add recipe
    useEffect(() => {
        if(user) {
            setShowAddRecipeButton(true);
        }
    }, [user])

    useEffect(() => {
        if(user) {
            // Apply search to the recipes
            let recipes = user.recipes;
            if (search) {
                const formattedSearchTerm = search.replace('-', ' ').toLowerCase();
                recipes = 
                    user.recipes.filter(recipe => {
                        return recipe.name.toLowerCase().split(' ').includes(formattedSearchTerm) || recipe.tags.includes(formattedSearchTerm);
                    })
            }

            // Slice the searched recipes into what will be displayed on this page
            const numRecipes = recipes.length;
            const resultsPerPage = numCols * numRows;
            setTotalPages(Math.ceil(numRecipes / resultsPerPage));

            const startIndex = (page - 1) * resultsPerPage;
            const endIndex = Math.min((page * resultsPerPage), numRecipes)

            // Apply pagination to recipes
            const filteredRecipesToShow = recipes.slice(startIndex, endIndex);

            setRecipesToShow(filteredRecipesToShow);            
        }
    }, [user, page, search])

    const renderedRecipeCards = (() => {
        if (user) {
            return (
                recipesToShow.map(recipe => {
                    return <RecipeCardWithFeatures 
                        key={recipe._id} 
                        recipe={recipe}
                        editMode={true} 
                        setError={setError as (err: Error | null) => void}
                        setDeletedRecipeName={setDeletedRecipeName} 
                    />
                })
            );
        } else {
            return [];
        }
    })();

    if (!user) {
        const e = new Error();
        e.name = 'NotLoggedIn';
        return <GlobalErrorDisplay error={e} />
    }

    return (
        <div>
            <section className="section column is-7">
                <h3 className="is-size-4 has-text-weight-bold mb-5">My Recipes:</h3>
                <div className="container is-flex is-justify-content-space-between py-5">
                    <div className="is-half">
                        <SearchBar initialSearchTerm={search} onSearch={searchTerm => navigate(`/myRecipes/1/${searchTerm}`)} />
                    </div>
                    {showAddRecipeButton &&
                        <Link to="/editRecipe">
                            <button className="button">New Recipe</button>
                        </Link>  
                    }
                </div>
                {deletedRecipeName !== '' &&
                    <FormError className="mb-3" message={`Recipe '${deletedRecipeName}' successfully deleted.`} success />
                }
                {error &&
                    <FormError className="mb-3" message={'There was an error with this request.'} danger />
                }
                <CardList list={renderedRecipeCards} numCols={numCols} />
                <Pagination 
                    currentPage={page} 
                    onFirstPageButtonClicked={() => navigate(`/myRecipes/${1}`)}
                    onPreviousPageButtonClicked={() => navigate(`/myRecipes/${page - 1}`)} 
                    onNextPageButtonClicked={() => navigate(`/myRecipes/${page + 1}`)}
                    onLastPageButtonClicked={() => navigate(`/myRecipes/${totalPages}`)}
                    numPages={totalPages} 
                />
            </section>
        </div>
    );
    
}

export default UserRecipesPage;