import styles from './GroceryListPage.module.css';
import { useEffect, useState } from 'react';
import { useLoaderData, useRouteLoaderData } from 'react-router';
import { GroceryListLoaderResult } from './groceryListLoader';
import { RootLoaderResult } from '../root/rootLoader';
import GlobalErrorDisplay from '../../components/globalErrorDisplay/GlobalErrorDisplay';
import { StandardMeasurements } from '../../api/types/standardized';
import { formatWithUnicodeFraction } from '../../utils/helpers';
import { createAppError } from '../../utils/errors/factory';
import { AppErrorCodes } from '../../utils/errors/codes';
import { CategorizedIngredients } from '../../api/types/groceryList';

export default function GroceryListPage({ mode }: { mode: 'recipe' | 'collection' }) {
    // const navigate = useNavigate();
    const { standardIngredients, standardMeasurements } = useRouteLoaderData('root') as RootLoaderResult;
    const { groceryList } = useLoaderData() as GroceryListLoaderResult;
    const [ groceryListName, setGroceryListName ] = useState<string>("Unknown");
    const [ ingredientsList, setIngredientsList ] = useState<CategorizedIngredients>({
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

    if (!groceryList) {
        const e = createAppError({ 
            code: AppErrorCodes.MISSING_LOADER_DATA,
            message: 'Could not properly load required data: grocery list'
        });
        return <GlobalErrorDisplay error={e} /> 
    }

    useEffect(() => {
        if (groceryList) {
            setGroceryListName(groceryList.name);
            setIngredientsList(groceryList.categorizedIngredients)
        }
    }, [groceryList])
    

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
                            <p className={`subsection-title ${styles.for}`}><span className="text">For:</span>{' ' + groceryListName}</p>
                            <div className={styles.actionLine}>
                                <p><span>Servings:</span>{' 4'}</p>
                                <p>🌱 Vegetarian</p>
                            </div>
                        </header>
                    </section>

                    <section className="section standardizedIngredientsSection">
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
                                                <li key={ingredient.name} className={styles.ingredientListItem}>
                                                    <input type="checkbox" className={styles.ingredientCheckbox} />
                                                    <div className={styles.ingredientText}>
                                                        {ingredient.normalizedRequiredUnitQuantity > 0 &&
                                                                <span className={styles.ingredientAmount}>
                                                                    {`${getFormattedQuantityAndUnitLabel(
                                                                        ingredient.normalizedRequiredUnitQuantity, 
                                                                        ingredient.normalizedUnit, 
                                                                        standardMeasurements,
                                                                    )} `}
                                                                </span>
                                                        }
                                                        <span className={styles.ingredientText}>
                                                            {`${(ingredient.normalizedRequiredUnitQuantity > 1 && standardIngredients) ? 
                                                                        standardIngredients[ingredient.name].plural : ingredient.name}`}
                                                        </span>
                                                        {(ingredient.optionalStandardQuantity > 0 || ingredient.hasArbitraryOptionalAmount) &&
                                                            <span className={styles.optionalIngredient}>
                                                                {' - ('}
                                                                {ingredient.optionalStandardQuantity > 0 &&
                                                                    (ingredient.normalizedRequiredUnitQuantity <= 0 
                                                                        ? 'optional: '
                                                                        : '+'
                                                                    ) +
                                                                    (ingredient.optionalStandardQuantity > 0 ?
                                                                        `${getFormattedQuantityAndUnitLabel(
                                                                            ingredient.normalizedOptionalUnitQuantity, 
                                                                            ingredient.normalizedUnit, 
                                                                            standardMeasurements
                                                                        )}` : ""
                                                                    ) +
                                                                    (ingredient.normalizedRequiredUnitQuantity > 0 ? ' optional' : "")
                                                                }
                                                                {(ingredient.optionalStandardQuantity > 0 && ingredient.hasArbitraryOptionalAmount) &&
                                                                    "; "
                                                                }
                                                                {ingredient.hasArbitraryOptionalAmount && '+ optional to taste'}
                                                                {')'}
                                                            </span>
                                                        }
                                                    </div>
                                                </li>
                                            )
                                        })}
                                    </div>
                                )
                            })}
                        </div>
                    </section>

                    {ingredientsList.miscellaneousIngredients.length > 0 &&
                        <section className={`section ${styles.miscellaneousSection}`}>
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
                    }
                </div>
            </div>
        </div>
    )
}

function getFormattedQuantityAndUnitLabel(
    quantity: number,
    unit: string | null,
    standardMeasurements: StandardMeasurements | null
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