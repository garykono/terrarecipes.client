import styles from './GroceryListPage.module.css';
import { Fragment, useEffect, useState } from 'react';
import { useLoaderData, useRouteLoaderData } from 'react-router';
import { GroceryListLoaderResult } from './groceryListLoader';
import { RootLoaderResult } from '../root/rootLoader';
import GlobalErrorDisplay from '../../components/GlobalErrorDisplay';
import { StandardMeasurements } from '../../api/types/standardized';
import { formatWithUnicodeFraction } from '../../utils/helpers';
import { categorizeAndCombineIngredients, CategorizedAndCombinedIngredients, combineIngredients } from '../../utils/combineIngredients/index'

export default function GroceryListPage({ mode }: { mode: 'recipe' | 'collection' }) {
    // const navigate = useNavigate();
    const { standardIngredients, standardMeasurements, standardIngredientsLookupTable, standardMeasurementsLookupTable } = useRouteLoaderData('root') as RootLoaderResult;
    const { name, recipes } = useLoaderData() as GroceryListLoaderResult;
    const [ingredientsList, setIngredientsList] = useState<CategorizedAndCombinedIngredients>({
        standardizedIngredients: {},
        miscellaneousIngredients: []
    });
    const [error, setError] = useState(null);

    const categoryColors: Record<string, string> = {
        "🥕 Vegetables": 'var(--category-color-vegetables)',
        "🍎 Fruits": 'var(--category-color-fruits)',
        "🌾 Grains & Legumes": 'var(--category-color-grains)',
        "🥛 Dairy & Eggs": 'var(--category-color-dairy)',
        "🍖 Meat & Seafood": 'var(--category-color-meat-and-seafood)',
        "🧂 Seasonings & Spices": 'var(--category-color-seasonings-and-spices)',
        "🍞 Baking Ingredients": 'var(--category-color-baking)',
        "🫒 Oils & Vinegars": 'var(--category-color-oils-and-vinegars)',
        "🍷 Wines": 'var(--category-color-wines)',
        "❓ Uncategorized": 'var(--category-color-uncategorized)'
    };

    if (!recipes) {
        const e = new Error();
        e.name = 'NoID';
        return <GlobalErrorDisplay error={e} />
    }

    useEffect(() => {
        if (recipes) {
            const uncombinedIngredientsList = recipes.flatMap(recipe => {
                return recipe.ingredients.filter(ingredient => !ingredient.isSection)
            });
            // Combine similar ingredients
            const combinedIngredients = combineIngredients({ 
                uncombinedIngredients: uncombinedIngredientsList, 
                standardIngredients,
                standardIngredientsLookupTable,
                standardMeasurements,
                standardMeasurementsLookupTable
            });
            
            // Break the ingredients into categories
            const categorizedAndCombinedIngredients = categorizeAndCombineIngredients(combinedIngredients)
            setIngredientsList(categorizedAndCombinedIngredients)
        }
    }, [])
    

    if (error) {
        return <GlobalErrorDisplay error={error} />;
    }

    return (
        <div className="page-recipe">
            <div className="container">
                <div className={`${styles.groceryList}`}>
                    <section className={styles.header}>
                        <header className={styles.header}>
                            <h1 
                                className={`page-title underlined-title ${styles.recipeTitle}`}
                                style={{ "--category-color": "var(--grey)" } as React.CSSProperties}
                            >
                                🛒 Grocery List
                            </h1>
                            <p className={`subsection-title ${styles.for}`}><span className="text">For:</span>{' ' + name}</p>
                            <div className={styles.actionLine}>
                                <p><span>Servings:</span>{' 4'}</p>
                                <p>🌱 Vegetarian</p>
                            </div>
                        </header>
                    </section>

                    <section className="standardizedIngredientsSection">
                        <div className={`grid grid--cols-3 ${styles.ingredientsList}`}>
                            {Object.keys(ingredientsList.standardizedIngredients).map((categoryName) => {
                                const categoryIngredients = ingredientsList.standardizedIngredients[categoryName];
                                return (
                                    <div 
                                        key={categoryName}
                                        className={`card card--grocery-category left-border-gradient ${styles.categoryIngredientSection}`} 
                                        style={{ "--category-color": categoryColors[categoryName] } as React.CSSProperties}
                                    >
                                        <h3 className={`subsection-title underlined-title ${styles.categoryTitle}`}>{categoryName}</h3>
                                        {categoryIngredients.map((ingredient, key) => {
                                            return (
                                                <ul key={ingredient.name}>
                                                    {ingredient.normalizedRequiredUnitQuantity > 0 &&
                                                        <li key={ingredient.name + ".required"} className={styles.ingredientListItem}>
                                                            <input type="checkbox" className={styles.ingredientCheckbox} />
                                                            <span className={styles.ingredientAmount}>
                                                                {`${getFormattedQuantityAndUnitLabel(
                                                                    ingredient.normalizedRequiredUnitQuantity, 
                                                                    ingredient.normalizedRequiredUnit, 
                                                                    standardMeasurements,
                                                                    ingredient.hasOptionalIngredientInThisList
                                                                )} `}
                                                            </span>
                                                            <span className={styles.ingredientText}>
                                                                {(ingredient.normalizedRequiredUnitQuantity > 1 && standardIngredients) ? 
                                                                    standardIngredients[ingredient.name].plural : ingredient.name}
                                                            </span>
                                                        </li>
                                                    }
                                                    {ingredient.hasOptionalIngredientInThisList &&
                                                        <li key={ingredient.name + ".optional"} className={styles.ingredientListItem}>
                                                            <input type="checkbox" className={styles.ingredientCheckbox} />
                                                            <span className={styles.ingredientAmount}>
                                                                {ingredient.normalizedRequiredUnitQuantity > 0 ? 'Optional: more ' : 'Optional: '}
                                                            </span>
                                                            <span className={styles.ingredientText}>
                                                                {(ingredient.normalizedRequiredUnitQuantity > 1 && standardIngredients) ? 
                                                                    standardIngredients[ingredient.name].plural : ingredient.name}
                                                            </span>
                                                        </li>
                                                    }
                                                </ul>
                                            )
                                        })}
                                    </div>
                                )
                            })}
                        </div>
                    </section>

                    <section className={`${styles.miscellaneousSection}`}>
                        <h2 className={`section-title ${styles.miscellaneousTitle}`}>Miscellaneous Ingredients:</h2>

                        <ul className={''}>
                            {ingredientsList.miscellaneousIngredients.map((ingredientText, index) => (
                                <li key={index} className={styles.ingredientListItem}>
                                    <input type="checkbox" className={styles.ingredientCheckbox} />
                                    {ingredientText}
                                </li>
                            ))}
                        </ul>
                    </section>
                </div>
            </div>
        </div>
    )
}

function getFormattedQuantityAndUnitLabel(
    quantity: number,
    unit: string | null,
    standardMeasurements: StandardMeasurements | null,
    hasOptionalIngredientInThisList: boolean
): string {
    let label = "";
    // Quantity
    if (quantity === 0) {
        return label
    } else {
        label = label + formatWithUnicodeFraction(quantity) + " ";
    };

    // Unit
    if (!unit) return label;

    //if (unit === "fluid ounce") unit = "ounce";
    if (unit === "whole") {
        return label;
    } else if (quantity > 1 && standardMeasurements && standardMeasurements[unit]?.plural) {
        label = label + standardMeasurements[unit].plural;
    } else {
        label = label + unit;
    }
    return label;
}