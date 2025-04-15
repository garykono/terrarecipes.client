import { useState } from 'react'
import { useLoaderData, Link, useRouteLoaderData, useNavigate } from 'react-router-dom';
import { editCollectionById, getCollectionById } from '../../api/queries/collectionApi';
import TagList from '../../components/TagList';
import GlobalErrorDisplay from '../../components/GlobalErrorDisplay';
import { RootLoaderResult } from '../root/rootLoader';
import { SingleRecipeLoaderResult } from './singleRecipeLoader';
import { RecipeFieldWithSection } from '../../api/types/recipe';

function SingleRecipePage() {
    const navigate = useNavigate();
    const { user } = useRouteLoaderData('root') as RootLoaderResult;
    const { recipe } = useLoaderData() as SingleRecipeLoaderResult;

    const [addToCollectionDropdownButtonStatus, setAddToCollectionDropdownButtonStatus] = useState("");
    const [addToCollectionStatus, setAddToCollectionStatus] = useState("");
    const [error, setError] = useState(null);

    const handleAddToCollection = async (collectionId: string) => {
        if (!recipe) return;

        // First, retrieve the collection
        const collection = await getCollectionById(collectionId)
            .then(responseData => {
                return responseData;
            })
            .catch(err => {
                setError(err);
                console.log(err);
                setAddToCollectionStatus('Failed to add to collection.')
            })
        if (!collection) {
            return;
        }

        // Next, format retrieved recipes into an array of recipe ids, which is the format that a recipe's collections 
        // is actually stored as
        const collectionRecipeIds = collection.recipes.map(recipe => recipe._id);

        // Then, add the recipe id to the collection
        if (!collectionRecipeIds.includes(recipe._id)) {
            const updatedCollectionIds = [...collectionRecipeIds, recipe._id];
            
            editCollectionById(collection._id, {
                    recipes: updatedCollectionIds
                }).then(() => {
                    setAddToCollectionStatus(`Recipe added to collection '${collection.name}'`)
                    // Update the user after the addition. Probably make the change locally instead of relying on another request in the
                    // future
                    navigate('.');
                }).catch(err => {
                    setError(err);
                    console.log(err);
                    setAddToCollectionStatus('Failed to add to collection.')
                }
                );
        } else {
            setAddToCollectionStatus(`Recipe already in collection '${collection.name}'`)
        }
        // Finally, remove the drop down menu after an option is clicked
        setAddToCollectionDropdownButtonStatus(""); 
        
    }

    function renderListWithSections(list: RecipeFieldWithSection[]) {
        return list.map((item, index) => {
            if (item.isSection) {
                return (
                    <h5 
                        className="is-size-5 is-underlined has-text-weight-medium mt-5 mb-3" 
                        key={index}>
                            {item.text}
                    </h5>
                );
            } else {
                return <li key={index}>{item.text}</li>;
            }
        })
    }

    const addToCollectionDropdownButton = (
        <div className={`dropdown ${addToCollectionDropdownButtonStatus}`}>
            <div className="dropdown-trigger">
                <button 
                    className="button" 
                    onClick={() => setAddToCollectionDropdownButtonStatus(
                        addToCollectionDropdownButtonStatus === "" ? "is-active" : ""
                    )}>
                    <span>+ Add to Collection</span>
                </button>
            </div>
            <div className="dropdown-menu" id="dropdown-menu" role="menu">
                <div className="dropdown-content">
                    {user && user.collections.length > 0 ?
                        user.collections.map((collection) => {
                            return (
                                <a 
                                    key={collection._id} 
                                    className="dropdown-item is-clickable"
                                    onClick={() => handleAddToCollection(collection._id)}
                                >
                                        {collection.name}
                                </a>
                            );
                        }) : <div className="dropdown-item">Create a collection and it will show up here!</div>
                    }
                </div>
            </div>
        </div>
    )

    if (error) {
        return <GlobalErrorDisplay error={error} />;
    }

    if (!recipe) {
        const e = new Error();
        e.name = 'NoID';
        return <GlobalErrorDisplay error={e} />
    }

    return (
        <div className="column is-8 mx-6">
            <div className="is-flex is-justify-content-right">
                {user && 
                    <div>
                        {user.recipes.map(recipe => recipe._id).includes(recipe._id) &&
                            <Link to={`/editRecipe/${recipe._id}`}>
                                <button className="button">
                                    Edit Recipe
                                </button>
                            </Link>
                        }
                        <div className="my-2">
                            {addToCollectionDropdownButton}
                        </div>
                        <p>{addToCollectionStatus}</p>
                    </div>
                }
            </div>
            <section className="section">
                <div className="container mb-6">
                    <h1 className="is-size-1 has-text-weight-bold">{recipe.name}</h1>
                    <div className="is-flex is-align-items-center ml-3">
                        <p className="has-text-weight-normal is-size 6 mr-1">by</p>
                        <p className="has-text-weight-semibold is-size-6 my-color">
                            {recipe.author? recipe.author.username : 'deleted-user'}
                        </p>
                    </div>
                </div>
                <p>{recipe.description}</p>
                <div className="column is-6 my-4">
                    <div className="image is-square">
                        <img 
                            className="image is-square" 
                            src={recipe.image? recipe.image : "https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png"} 
                        />
                    </div>
                </div>
            </section>

            <section className="section content">
                <h3 className="is-size-3 has-text-weight-bold">Ingredients</h3>
                <ul>
                    {renderListWithSections(recipe.ingredients)}
                </ul>
            </section>
            
            <section className="section content">
                <h3 className="is-size-3 has-text-weight-bold">Directions</h3>
                <ol>
                    {renderListWithSections(recipe.directions)}
                </ol>
            </section>

            <TagList tags={recipe.tags} />
        </div>
    )
}

export default SingleRecipePage;