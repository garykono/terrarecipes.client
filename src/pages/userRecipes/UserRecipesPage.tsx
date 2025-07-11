import styles from './UserRecipesPage.module.css';
import { useState, useEffect, useContext } from 'react'
import { useNavigate, Link, useRouteLoaderData, useLoaderData } from 'react-router-dom';
import SearchBar from "../../components/searchBar/SearchBar";
import RecipeCardWithFeatures from '../../components/recipeCardWithFeatures/RecipeCardWithFeatures';
import CardList from '../../components/cardList/CardList';
import Pagination from '../../components/pagination/Pagination';
import FormError from '../../components/formMessage/FormMessage';
import GlobalErrorDisplay from '../../components/GlobalErrorDisplay';
import { RootLoaderResult } from '../root/rootLoader';
import { Recipe } from '../../api/types/recipe';
import BasicHero from '../../components/basicHero/BasicHero';

function UserRecipesPage() {
    const navigate = useNavigate();
    const { user } = useRouteLoaderData('root') as RootLoaderResult;
    const { search } = useLoaderData();
    const { page, numResults } = useLoaderData();
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
            setTotalPages(Math.ceil(numRecipes / numResults));

            const startIndex = (page - 1) * numResults;
            const endIndex = Math.min((page * numResults), numRecipes)

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
        <div className={styles.pageUserRecipes}>
            <BasicHero title="My Recipes" text="View and manage your uploaded recipes." />

            <div className='container'>
                <div className="create-recipe">
                    <div className={styles.createRecipe}>
                        {showAddRecipeButton &&
                            <Link to="/createRecipe">
                                <button className="button button--outline">New Recipe</button>
                            </Link>  
                        }
                    </div>
                </div>
            </div>

            <div className="container">
                <div className={styles.recipes}>
                    <SearchBar initialSearchTerm={search} onSearch={searchTerm => navigate(`/myRecipes/1/${searchTerm}`)} className={styles.search} />
                    
                    {deletedRecipeName !== '' &&
                        <FormError className="mb-3" message={`Recipe '${deletedRecipeName}' successfully deleted.`} success />
                    }
                    {error &&
                        <FormError className="mb-3" message={'There was an error with this request.'} danger />
                    }
                    
                    <CardList list={renderedRecipeCards} className={styles.cardList} />
                    <Pagination 
                        currentPage={page} 
                        onFirstPageButtonClicked={() => navigate(`/myRecipes/${1}`)}
                        onPreviousPageButtonClicked={() => navigate(`/myRecipes/${page - 1}`)} 
                        onNextPageButtonClicked={() => navigate(`/myRecipes/${page + 1}`)}
                        onLastPageButtonClicked={() => navigate(`/myRecipes/${totalPages}`)}
                        numPages={totalPages} 
                    />
                </div>
            </div>
        </div>
    );
    
}

export default UserRecipesPage;