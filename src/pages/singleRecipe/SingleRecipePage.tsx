import styles from './SingleRecipePage.module.css';
import { useState } from 'react'
import { useLoaderData, Link, useRouteLoaderData, useNavigate } from 'react-router-dom';
import { editCollectionById, getCollectionById } from '../../api/queries/collectionApi';
import TagList from '../../components/tagList/TagList';
import GlobalErrorDisplay from '../../components/GlobalErrorDisplay';
import { RootLoaderResult } from '../root/rootLoader';
import { SingleRecipeLoaderResult } from './singleRecipeLoader';
import { Ingredient, Direction } from '../../api/types/recipe';
import FormMessage from '../../components/formMessage/FormMessage';
import RelatedLinks from '../../components/relatedLinks/RelatedLinks';
import Toolbar, { ToolbarAction } from '../../components/toolbar/Toolbar';
import Dropdown from '../../components/dropdown/Dropdown';

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

    function renderListWithSections(list: Ingredient[] | Direction[]) {
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

    if (error) {
        return <GlobalErrorDisplay error={error} />;
    }

    if (!recipe) {
        const e = new Error();
        e.name = 'NoID';
        return <GlobalErrorDisplay error={e} />
    }

    const recipeActions: ToolbarAction[] = [];
    // Grocery list
    recipeActions.push({ label: "Grocery List", icon: "🛒", to: `/groceryList/recipe/${recipe._id}` });
    
    if (user) {
        // Edit Recipe
        if (user && user.recipes.some(r => r._id === recipe._id)) {
            recipeActions.push({
                label: "Edit Recipe",
                icon: "✏️", // optional
                to: `/editRecipe/${recipe._id}`
            });
        }

        // Add to collection
        const collectionItems = user.collections.map((collection) => ({
            id: collection._id,
            label: collection.name,
            onClick: () => handleAddToCollection(collection._id),
        })) ?? [];
        recipeActions.push({ 
            element: <Dropdown 
                label={'Add to Collection'} 
                items={collectionItems} 
                alignment="right"
                triggerClassName='toolbar--button'
                noItemsMessage='Create a collection and it will show up here!'
            />
        })
    }

    return (
        <div className="page-recipe">
            <div className="container">
                <Toolbar actions={recipeActions} />
                <FormMessage className={styles.toolbarMessage} message={addToCollectionStatus} />
            </div>

            <div className="container">
                <div className={`card--padded ${styles.recipe}`}>
                    <div className={`${styles.sectionOverview}`}>
                        <div className={styles.overviewWrapper}>
                            <div className={styles.textOverview}>
                            <h1 className="page-title">{recipe.name}</h1>
                                {/* <div className={styles.author}>
                                    by <span className={styles.authorText}>
                                        {recipe.author? recipe.author.username : 'deleted-user'}
                                    </span>
                                </div> */}

                                <div className={styles.description}>
                                    <p className="description">{recipe.description}</p>
                                </div>
                            </div>

                            <img 
                                className={styles.recipeImage}
                                src={recipe.image? recipe.image : "https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png"} 
                            />

                            <ul className={styles.quickInfoList}>
                                <li>⭐ 4.7 (12)</li>
                                <li>⏱ 45 min</li>
                                <li>🍽 4 servings</li>
                                <li>🌱 Vegetarian</li>
                            </ul>
                        </div>
                    </div>

                    <div className={`section ${styles.sectionIngredientsAndDirections}`}>
                        <div className={styles.ingredientsAndDirectionsWrapper}>
                            <div className={`card card--padded ${styles.ingredientsWrapper}`}>
                                <h2 
                                    className={`heading-secondary underlined-title ${styles.ingredientsTitle}`}
                                    style={{ "--category-color": 'var(--primary-dark)' } as React.CSSProperties}
                                >
                                    Ingredients
                                </h2>
                                <ul className={styles.ingredientsList}>
                                    {renderListWithSections(recipe.ingredients)}
                                </ul>
                            </div>
                            <div className={`card card--padded ${styles.directionsWrapper}`}>
                                <h2 
                                    className={`heading-secondary underlined-title ${styles.ingredientsTitle}`}
                                    style={{ "--category-color": 'var(--primary-dark)' } as React.CSSProperties}
                                >
                                    Directions
                                </h2>
                                <ol className={styles.directionsList}>
                                    {renderListWithSections(recipe.directions)}
                                </ol>
                            </div>
                        </div>
                    </div>

                    <div className={styles.sectionTags}>
                        <TagList tags={recipe.tags} />
                    </div>
                </div>
                
                <div className={`section ${styles.sectionRelatedLinks}`}>
                        <RelatedLinks links={[
                            { label: "Home (Placeholder)", to: "/"},
                            { label: "Browse (Placeholder)", to: "/browse"}
                        ]}/>
                </div>
            </div>
        </div>
    )
}

export default SingleRecipePage;