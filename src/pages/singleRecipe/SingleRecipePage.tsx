import styles from './SingleRecipePage.module.css';
import { useState } from 'react'
import { useLoaderData, Link, useRouteLoaderData, useNavigate } from 'react-router-dom';
import { editCollectionById, getCollectionById } from '../../api/queries/collectionApi';
import TagList from '../../components/tagList/TagList';
import GlobalErrorDisplay from '../../components/GlobalErrorDisplay';
import { RootLoaderResult } from '../root/rootLoader';
import { SingleRecipeLoaderResult } from './singleRecipeLoader';
import { RecipeFieldWithSection } from '../../api/types/recipe';
import FormMessage from '../../components/formMessage/FormMessage';

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
                    <div 
                        className={`heading-tertiary ${styles.listItemIsSection}`}
                        key={index}>
                            {item.text}
                    </div>
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
                        addToCollectionDropdownButtonStatus === "" ? "dropdown--is-active" : ""
                    )}>
                    <span>+ Add to Collection</span>
                </button>
            </div>
            <div className="dropdown-menu">
                <div className="dropdown-content">
                    {user && user.collections.length > 0 ?
                        user.collections.map((collection) => {
                            return (
                                <a 
                                    key={collection._id} 
                                    className="dropdown-item"
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
        <div className="page-recipe">
            {user && (
                <div className="container">
                    <div className={`${styles.recipeManagementButtonsContainer}`}>
                        <div className={styles.recipeManagementButtons}>
                            {user.recipes.map(recipe => recipe._id).includes(recipe._id) &&
                                <Link to={`/editRecipe/${recipe._id}`}>
                                    <button className="button">
                                        Edit Recipe
                                    </button>
                                </Link>
                            }
                            <div className={styles.addToCollection}>
                                {addToCollectionDropdownButton}
                                
                                <FormMessage message={addToCollectionStatus} />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className={styles.sectionHeading}>
                <div className="container">
                    <h1 className="heading-primary">{recipe.name}</h1>
                    {/* <div className={styles.author}>
                        by <span className={styles.authorText}>
                            {recipe.author? recipe.author.username : 'deleted-user'}
                        </span>
                    </div> */}
                </div>
            </div>

            <div className={styles.sectionDescription}>
                <div className="container">
                    <div className={styles.control}>
                        <p className="text">{recipe.description}</p>
                    </div>
                </div>
            </div>

            <div className={styles.sectionImage}>
                <div className="container">
                    <img 
                        className={styles.recipeImage}
                        src={recipe.image? recipe.image : "https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png"} 
                    />
                </div>
            </div>

            <div className={styles.sectionIngredients}>
                <div className="container">
                    <h2 className="heading-secondary">Ingredients</h2>
                    <ul className={styles.ingredientsList}>
                        {renderListWithSections(recipe.ingredients)}
                    </ul>
                </div>
            </div>
            
            <div className={styles.sectionDirections}>
                <div className="container">
                    <h2 className="heading-secondary">Directions</h2>
                    <div className={styles.control}>
                        <ol className={styles.directionsList}>
                            {renderListWithSections(recipe.directions)}
                        </ol>
                    </div>
                </div>
            </div>

            <div className={styles.sectionTags}>
                <div className="container">
                    <TagList tags={recipe.tags} />
                </div>
            </div>
        </div>
    )
}

export default SingleRecipePage;