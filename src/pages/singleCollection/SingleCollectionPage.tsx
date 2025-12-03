import styles from './SingleCollectionPage.module.css';
import { useState, useEffect } from 'react';
import { useLoaderData, useNavigate, useRouteLoaderData } from 'react-router-dom';
import RecipeCardWithFeatures from '../../components/recipeCardWithFeatures/RecipeCardWithFeatures';
import CardList from '../../components/cardList/CardList';
import Pagination from '../../components/pagination/Pagination';
import { SingleCollectionLoaderResult } from './singleCollectionLoader';
import GlobalErrorDisplay from '../../components/globalErrorDisplay/GlobalErrorDisplay';
import { Recipe } from '../../api/types/recipe';
import { RootLoaderResult } from '../root/rootLoader';
import Toolbar, { ToolbarAction } from '../../components/toolbar/Toolbar';
import { createAppError } from '../../utils/errors/factory';
import { AppErrorCodes } from '../../utils/errors/codes';

function SingleCollectionPage() {
    const { user } = useRouteLoaderData('root') as RootLoaderResult;
    const navigate = useNavigate();

    // Recipes list and pagination data
    const { collection, page, numResults } = useLoaderData() as SingleCollectionLoaderResult;
    const [ recipesToShow, setRecipesToShow ] = useState<Recipe[]>([]);
    const [ totalPages, setTotalPages ] = useState(1);

    // Pagination Data
    useEffect(() => {
        const numUserRecipes = collection? collection.recipes.length : 0;

        const startIndex = (page - 1) * numResults;
        const endIndex = Math.min((page * numResults), numUserRecipes)

        setRecipesToShow(collection? collection.recipes.slice(startIndex, endIndex) : []);
        setTotalPages(Math.ceil(numUserRecipes / numResults));
    }, [page])

    if (!collection) {
        return <GlobalErrorDisplay error={createAppError({ code: AppErrorCodes.NO_ID })} /> 
    }

    const collectionActions: ToolbarAction[] = [];
    if (collection) {
        collectionActions.push({ label: "Make Grocery List", icon: "🛒", to: `/groceryList/collection/${collection._id}` });
    }
    
    if (user) {
        // Edit Recipe
        if (user.collections.map(collection => collection._id).includes(collection._id)) {
            collectionActions.push({
                label: "Edit Collection",
                icon: "✏️", // optional
                to: `/editCollection/${collection._id}`
            });
        }
    }

    const renderedRecipeCards = recipesToShow.map(recipe => {
        return <RecipeCardWithFeatures key={recipe._id} recipe={recipe} />;
    })

    return (
        <div className="page-single-collection">
            <div className="container">
                <Toolbar actions={collectionActions} />
                
                <div className={`${styles.info}`}>
                    <h1 className={`page-title underlined-title category-color-standard ${styles.title}`}>{collection.name}</h1>

                    <div className={styles.subInfo}>
                        <p className={`subsection-title ${styles.numRecipesLine}`}>{`📖 ${collection.recipes.length} recipes`}</p>
                        <p className={`text ${styles.description}`}>{collection.description}</p>    
                    </div>
                </div>            

                <CardList list={renderedRecipeCards} className={styles.cardList} />
                <Pagination 
                        currentPage={page} 
                        onFirstPageButtonClicked={() => navigate(`/collection/${collection._id}/${1}`)}
                        onPreviousPageButtonClicked={() => navigate(`/collection/${collection._id}/${page - 1}`)} 
                        onNextPageButtonClicked={() => navigate(`/collection/${collection._id}/${page + 1}`)}
                        onLastPageButtonClicked={() => navigate(`/collection/${collection._id}/${totalPages}`)}
                        numPages={totalPages} 
                    />
            </div>
        </div>
    )
}

export default SingleCollectionPage;