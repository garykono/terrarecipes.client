import clsx from 'clsx';
import { useState } from 'react'
import { useLoaderData, useRouteLoaderData, useNavigate } from 'react-router-dom';
import styles from './SingleRecipePage.module.css';
import { RootLoaderResult } from '../root/rootLoader';
import { SingleRecipeLoaderResult } from './singleRecipeLoader';
import { editCollectionById, getCollectionById } from '../../api/queries/collectionApi';
import TagList from '../../components/tagList/TagList';
import GlobalErrorDisplay from '../../components/globalErrorDisplay/GlobalErrorDisplay';
import { Ingredient, Direction } from '../../api/types/recipe';
import FormMessage from '../../components/formMessage/FormMessage';
import RelatedLinks from '../../components/relatedLinks/RelatedLinks';
import Toolbar, { ToolbarAction } from '../../components/toolbar/Toolbar';
import Dropdown from '../../components/dropdown/Dropdown';
import { createAppError } from '../../utils/errors/factory';
import { AppErrorCodes } from '../../utils/errors/codes';
import { AppError } from '../../utils/errors/types';

export default function SingleRecipePage() {
    const navigate = useNavigate();
    const { user } = useRouteLoaderData('root') as RootLoaderResult;
    const { recipe } = useLoaderData() as SingleRecipeLoaderResult;

    const [addToCollectionDropdownButtonStatus, setAddToCollectionDropdownButtonStatus] = useState("");
    const [addToCollectionStatus, setAddToCollectionStatus] = useState("");
    const [error, setError] = useState<AppError | null>(null);

    const tags: string[] = Array.isArray(recipe?.tags)
        ? recipe.tags
        : Object.values(recipe?.tags?.facets ?? {}).flat().concat(recipe?.tags?.custom ?? []);

    const handleAddToCollection = async (collectionId: string) => {
        if (!recipe) return;

        // First, retrieve the collection
        const collection = await getCollectionById(collectionId)
            .then(responseData => {
                return responseData;
            })
            .catch(err => {
                setError(err);
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
                        className={clsx(
                            "heading-tertiary",
                            styles.listItemIsSection
                        )}
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
        return <GlobalErrorDisplay error={createAppError({ code: AppErrorCodes.NO_ID})} /> 
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
                <div className={clsx(
                    "card--padded",
                    styles.recipe
                )}>
                    <div className={styles.sectionOverview}>
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
                                {recipe.totalTimeMin && <li>⏱ {recipe.totalTimeMin} min</li>}
                                {recipe.servings && <li>🍽 {recipe.servings} servings</li>}
                                {/* {recipe.difficulty && <li>🔥 {recipe.difficulty.charAt(0).toUpperCase() + recipe.difficulty.slice(1)}</li>} */}
                                {/* <li>🌱 Vegetarian</li> */}
                            </ul>
                        </div>
                    </div>

                    <div className={clsx(
                        "section",
                        styles.sectionIngredientsAndDirections
                    )}>
                        <div className={styles.ingredientsAndDirectionsWrapper}>
                            <div className={clsx(
                                "card",
                                "card--padded",
                                styles.ingredientsWrapper
                            )}>
                                <h2 
                                    className={clsx(
                                        "heading-secondary",
                                        "underlined-title",
                                        styles.ingredientsTitle
                                    )}
                                    style={{ "--category-color": 'var(--primary-dark)' } as React.CSSProperties}
                                >
                                    Ingredients
                                </h2>
                                <ul className={styles.ingredientsList}>
                                    {renderListWithSections(recipe.ingredients)}
                                </ul>
                            </div>
                            <div className={clsx(
                                "card",
                                "card--padded",
                                styles.directionsWrapper
                            )}>
                                <h2 
                                    className={clsx(
                                    "heading-secondary",
                                    "underlined-title",
                                    styles.ingredientsTitle
                                )}
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
                        <TagList tags={tags} />
                    </div>
                </div>
                
                <div className={clsx(
                    "section",
                    styles.sectionRelatedLinks
                )}>
                        <RelatedLinks links={[
                            { label: "Home (Placeholder)", to: "/"},
                            { label: "Browse (Placeholder)", to: "/browse"}
                        ]}/>
                </div>
            </div>
        </div>
    )
}