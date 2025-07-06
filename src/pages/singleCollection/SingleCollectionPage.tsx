import styles from './SingleCollectionPage.module.css';
import { useState, useContext, useEffect } from 'react';
import { Link, useLoaderData, useNavigate, useRevalidator, useRouteLoaderData } from 'react-router-dom';
import RecipeCardWithFeatures from '../../components/recipeCardWithFeatures/RecipeCardWithFeatures';
import CardList from '../../components/cardList/CardList';
import Pagination from '../../components/pagination/Pagination';
import { SingleCollectionLoaderResult } from './singleCollectionLoader';
import GlobalErrorDisplay from '../../components/GlobalErrorDisplay';
import { Recipe } from '../../api/types/recipe';
import { RootLoaderResult } from '../root/rootLoader';

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

    const renderedRecipeCards = recipesToShow.map(recipe => {
        return <RecipeCardWithFeatures key={recipe._id} recipe={recipe} />;
    })

    if (!collection) {
        const e = new Error();
        e.name = 'NoID';
        return <GlobalErrorDisplay error={e} />
    }

    return (
        <div className="page-single-collection">
            <div className="container">
                    <div className={styles.firstSection}>
                        <div className={styles.info}>
                            <div className="heading-tertiary">Collection:</div>
                            <h1 className="heading-primary">{collection.name}</h1>
                            <p className={`text ${styles.description}`}>{collection.description}</p>    
                        </div>

                        <div className={styles.buttons}>
                            <Link to={`/groceryList/collection/${collection._id}`}>
                                <button className="button button--full">
                                    Make Grocery List
                                </button>
                            </Link>
                            {user && user.collections.map(collection => collection._id).includes(collection._id) && 
                                <button 
                                    className={`button ${styles.editButton}`} 
                                    onClick={() => navigate(`/editCollection/${collection._id}`)}
                                >
                                    Edit Collection
                                </button>
                            }
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