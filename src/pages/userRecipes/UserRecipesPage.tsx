import styles from './UserRecipesPage.module.css';
import { useState, useEffect } from 'react'
import { useNavigate, useRouteLoaderData, useLoaderData } from 'react-router-dom';
import { RootLoaderResult } from '../root/rootLoader';
import CardList from '../../components/cardList/CardList';
import Pagination from '../../components/pagination/Pagination';
import RecipeCardWithFeatures from '../../components/recipeCardWithFeatures/RecipeCardWithFeatures';
import SearchBar from "../../components/searchBar/SearchBar";
import FormError from '../../components/formMessage/FormMessage';
import GlobalErrorDisplay from '../../components/globalErrorDisplay/GlobalErrorDisplay';
import BasicHero from '../../components/basicHero/BasicHero';
import Toolbar from '../../components/toolbar/Toolbar';
import { createAppError } from '../../utils/errors/factory';
import { AppErrorCodes } from '../../utils/errors/codes';
import { UserRecipesLoaderResult } from './userRecipesLoader';

function UserRecipesPage() {
    const navigate = useNavigate();
    const { user } = useRouteLoaderData('root') as RootLoaderResult;
    const { userRecipes, totalPages, page, search } = useLoaderData() as UserRecipesLoaderResult;

    const [showAddRecipeButton, setShowAddRecipeButton] = useState(false);
    const [ deletedRecipeName, setDeletedRecipeName ] = useState('');
    const [ error, setError ] = useState(null);

    const searchSlug = search ? search : "";

    // Collection Modification
    const [showCollectionModificationButtons, setShowCollectionModificationButtons] = useState(false);

    // Show button to add recipe
    useEffect(() => {
        if (user && !user.verifiedAt) {
            navigate('/verificationRequired', { state: { email: user.email, fromLogin: false } })
        }
        if(user) {
            setShowAddRecipeButton(true);
        }
    }, [user])

    const renderedRecipeCards = (() => {
        if (user) {
            return (
                userRecipes.map(recipe => {
                    return <RecipeCardWithFeatures 
                        key={recipe._id} 
                        recipe={recipe}
                        editMode={showCollectionModificationButtons} 
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
        return <GlobalErrorDisplay error={createAppError({ code: AppErrorCodes.NOT_LOGGED_IN })} /> 
    }

    return (
        <div className={styles.pageUserRecipes}>
            <div className="container">
                {showAddRecipeButton && 
                    <Toolbar 
                        actions={[
                            { label: "Manage Recipes", icon: "✏️", onClick: () => setShowCollectionModificationButtons(!showCollectionModificationButtons) },
                            { label: "New Recipe", icon: "➕", to: '/createRecipe' }
                        ]} 
                    /> 
                }
            </div>

            <BasicHero title="My Recipes" text="View and manage your uploaded recipes." variant="underline" />

            <div className="container">
                <div className={styles.recipes}>
                    <SearchBar initialSearchTerm={search} onSearch={searchTerm => navigate(`/myRecipes/1/${searchTerm}`)} className={styles.search} />
                    
                    {deletedRecipeName !== '' &&
                        <FormError message={`Recipe '${deletedRecipeName}' successfully deleted.`} success />
                    }
                    {error &&
                        <FormError message={'There was an error with this request.'} danger />
                    }
                    
                    <CardList list={renderedRecipeCards} className={styles.cardList} />
                    <Pagination 
                        currentPage={page} 
                        onFirstPageButtonClicked={() => navigate(`/myRecipes/${1}/${searchSlug}`)}
                        onPreviousPageButtonClicked={() => navigate(`/myRecipes/${page - 1}/${searchSlug}`)} 
                        onNextPageButtonClicked={() => navigate(`/myRecipes/${page + 1}/${searchSlug}`)}
                        onLastPageButtonClicked={() => navigate(`/myRecipes/${totalPages}/${searchSlug}`)}
                        numPages={totalPages} 
                    />
                </div>
            </div>
        </div>
    );
    
}

export default UserRecipesPage;