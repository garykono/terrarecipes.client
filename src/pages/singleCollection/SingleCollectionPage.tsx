import { useState, useContext, useEffect } from 'react';
import { useLoaderData, useNavigate, useRevalidator, useRouteLoaderData } from 'react-router-dom';
import RecipeCardWithFeatures from '../../components/RecipeCardWithFeatures';
import CardList from '../../components/CardList';
import Pagination from '../../components/Pagination';
import { SingleCollectionLoaderResult } from './singleCollectionLoader';
import GlobalErrorDisplay from '../../components/GlobalErrorDisplay';
import { Recipe } from '../../api/types/recipe';
import { RootLoaderResult } from '../root/rootLoader';

function SingleCollectionPage() {
    const { user } = useRouteLoaderData('root') as RootLoaderResult;
    const navigate = useNavigate();

    // Recipes list and pagination data
    const { collection, page, numCols, numRows } = useLoaderData() as SingleCollectionLoaderResult;
    const [ recipesToShow, setRecipesToShow ] = useState<Recipe[]>([]);
    const [ totalPages, setTotalPages ] = useState(1);

    // Pagination Data
    useEffect(() => {
        const numUserRecipes = collection? collection.recipes.length : 0;
        const resultsPerPage = numCols * numRows;

        const startIndex = (page - 1) * resultsPerPage;
        const endIndex = Math.min((page * resultsPerPage), numUserRecipes)

        setRecipesToShow(collection? collection.recipes.slice(startIndex, endIndex) : []);
        setTotalPages(Math.ceil(numUserRecipes / resultsPerPage));
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
        <div className="column is-8 mx-6">
            <section className="section">
                <div className="is-flex is-flex-direction-column">
                    <div className='is-flex is-justify-content-space-between'>
                        <p className="is-size-5 my-color">Collection:</p>
                        {user && user.collections.map(collection => collection._id).includes(collection._id) && 
                            <button className='button' onClick={() => navigate(`/editCollection/${collection._id}`)}>Edit Collection</button>}
                    </div>
                    <p className="title is-size-1 mb-5">{collection.name}</p>
                    <p>{collection.description}</p>        
                </div>     
            </section>

            <section className="section">
                <CardList list={renderedRecipeCards} numCols={numCols} />
                <Pagination 
                        currentPage={page} 
                        onFirstPageButtonClicked={() => navigate(`/collection/${collection._id}/${1}`)}
                        onPreviousPageButtonClicked={() => navigate(`/collection/${collection._id}/${page - 1}`)} 
                        onNextPageButtonClicked={() => navigate(`/collection/${collection._id}/${page + 1}`)}
                        onLastPageButtonClicked={() => navigate(`/collection/${collection._id}/${totalPages}`)}
                        numPages={totalPages} 
                    />
            </section>
        </div>

        
    )
}

export default SingleCollectionPage;