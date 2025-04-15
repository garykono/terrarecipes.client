import { useState, useContext, useEffect } from 'react';
import { useLoaderData, useNavigate, useRevalidator, useRouteLoaderData } from 'react-router-dom';
import { useForm } from 'react-hook-form'; 
import { CollectionUpdateProps, editCollectionById } from '../../api/queries/collectionApi';
import RecipeCardWithFeatures from '../../components/RecipeCardWithFeatures';
import CardList from '../../components/CardList';
import Pagination from '../../components/Pagination';
import FormMessage from '../../components/FormMessage';
import GlobalErrorDisplay from '../../components/GlobalErrorDisplay';
import { ErrorMessageSetter, useSetError } from '../../hooks/form-submit-error-handling';
import { CollectionEditLoaderResult } from './collectionEditLoader';
import { Recipe, RecipeWithMarkForDelete } from '../../api/types/recipe';
import { RootLoaderResult } from '../root/rootLoader';

export default function CollectionEditPage() {
    const { user } = useRouteLoaderData('root') as RootLoaderResult;

    const navigate = useNavigate();
    const revalidator = useRevalidator();

    // Recipes list and pagination data
    const { collection, page, numCols, numRows } = useLoaderData() as CollectionEditLoaderResult;
    const [ recipesToShow, setRecipesToShow ] = useState<Recipe[]>([]);
    const [ totalPages, setTotalPages ] = useState<number>(1);
    
    const { register, control, handleSubmit, setError, formState: { errors } } = useForm({
        defaultValues: {
            name: collection?.name? collection.name : "",
            description: collection?.description? collection.description: ""
        }
    })
    
    const [ collectionRecipes, setCollectionRecipes ] = useState<RecipeWithMarkForDelete[]>([]);

    // Add a "markedForDelete" to enable multiple recipes being deleted at once and providing that clearly in a UI
    useEffect(() => {
        if (collection) {
            const recipesWithMarkForDeleteAttribute = collection.recipes.map((recipe) => {
                return {...recipe, markForDelete: false};
            })
            setCollectionRecipes(recipesWithMarkForDeleteAttribute);
        }
    }, []);

    // Pagination setup
    useEffect(() => {
        const numUserRecipes = collection? collection.recipes.length : 0;
        const resultsPerPage = numCols * numRows;

        const startIndex = (page - 1) * resultsPerPage;
        const endIndex = Math.min((page * resultsPerPage), numUserRecipes);

        setRecipesToShow(collectionRecipes.slice(startIndex, endIndex));
        setTotalPages(Math.ceil(numUserRecipes / resultsPerPage));
    }, [collectionRecipes])

    /**
     * Removes the recipe from the local version of the collection.
     * @param {string} recipeId 
     */
    const markRecipeForDeletion = (recipeId: string) => {
        setCollectionRecipes(
            collectionRecipes.map((recipe) => {
                if (recipe._id === recipeId) {
                    return {...recipe, markForDelete: !recipe.markForDelete}
                } else {
                    return recipe;
                }
            })
        );
    }

    const onSubmit = ({ name, description}: { name: string, description: string}) => {
        if (!collection) {
            throw new Error('There is no collection loaded in a route that should only be accessible with a loaded collection.')
        }

        let updateJSON = {} as CollectionUpdateProps;
        if (name !== collection.name) {
            updateJSON.name = name;
        }
        if (description !== collection.description) {
            updateJSON.description = description;
        }

        // Filter out the deleted recipes and then transform into a list of recipe IDs we can use to update database
        updateJSON.recipes = collectionRecipes.filter(recipe => !recipe.markForDelete).map(recipe => recipe._id);

        editCollectionById(collection._id, updateJSON)
            .then(() => {
                revalidator.revalidate();
                navigate(`/collection/${collection._id}`)
            })
            .catch(err => {
                useSetError(err, setError as ErrorMessageSetter);
                // setError('root.general', { message: 'There was a problem with your request.' })
            })
    }

    const handleCancel = () => {
        navigate('/myCollections');
    }

    const renderedRecipeCards = recipesToShow.map(recipe => {
        return <RecipeCardWithFeatures key={recipe._id} recipe={recipe} collectionMode={true} onRemove={markRecipeForDeletion} />;
    })

    if (!user) {
        const e = new Error();
        e.name = 'NotLoggedIn';
        return <GlobalErrorDisplay error={e} />
    }

    if (!collection) {
        const e = new Error();
        e.name = 'NoID';
        return <GlobalErrorDisplay error={e} />
    }

    if (errors.root?.other) {
        return <GlobalErrorDisplay error={errors.root.other} />;
    }

    return (
        <div className="column is-8 mx-6">
            <form onSubmit={handleSubmit(onSubmit)}>

                <div className="field">
                    <label className="label">Collection Name: </label>
                    <div className="control">
                        <input 
                            className="input"
                            {...register("name", {
                                required: 'A collection must have a name.'
                            })}
                        />
                        {errors.name?.message &&
                            <FormMessage message={errors.name.message} danger />
                        }
                    </div>
                </div>

                <div className="field">
                    <label className="label">Description: </label>
                    <div className="control">
                        <textarea 
                            className="textarea"
                            rows={5}
                            {...register("description", {
                                maxLength: {
                                    value: 300,
                                    message: 'A collection description has a max length of 300 characters.'
                                }
                            })}
                        />
                        {errors.description?.message &&
                            <FormMessage message={errors.description.message} danger />
                        }
                    </div>
                </div>   

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
            
                <section className="section">
                        <div className="is-flex is-flex-direction-column">
                            {errors.root?.general.message &&
                                <FormMessage className="mb-3" message={errors.root.general.message} danger />
                            }
                            <div className="buttons">
                                <button className="button" type="button" onClick={handleCancel}>
                                    Cancel
                                </button>
                                <button className="button my-color-bg" type="submit">
                                    Save
                                </button>
                            </div>
                        </div>
                </section>
            </form>
        </div>
    )
}