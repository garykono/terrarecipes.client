import styles from './GroceryListPage.module.css';import { useEffect, useState } from 'react';
import { useLoaderData, useRouteLoaderData } from 'react-router';
import { GroceryListLoaderResult } from './groceryListLoader';
import { RootLoaderResult } from '../root/rootLoader';
import GlobalErrorDisplay from '../../components/GlobalErrorDisplay';
import BasicHero from '../../components/basicHero/BasicHero';
import { Ingredient } from '../../api/types/recipe';
import { combineIngredients, CombinedIngredients } from '../../utils/combineIngredients';
import { StandardMeasurements } from '../../api/types/standardized';

export default function GroceryListPage({ mode }: { mode: 'recipe' | 'collection' }) {
    // const navigate = useNavigate();
    const { standardIngredients, standardMeasurements, standardIngredientsLookupTable, standardMeasurementsLookupTable } = useRouteLoaderData('root') as RootLoaderResult;
    const { name, recipes } = useLoaderData() as GroceryListLoaderResult;
    const [ingredientsList, setIngredientsList] = useState<CombinedIngredients>({
        validatedIngredients: {},
        miscellaneous: []
    });
    const [error, setError] = useState(null);

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
            setIngredientsList(combineIngredients({ 
                uncombinedIngredients: uncombinedIngredientsList, 
                standardIngredients,
                standardIngredientsLookupTable,
                standardMeasurementsLookupTable
            }));
        }
    }, [])
    

    if (error) {
        return <GlobalErrorDisplay error={error} />;
    }

    return (
        <div className="page-recipe">
            <BasicHero title='Grocery List' />

            <div className="container">
                <div className={styles.groceryList}>
                    <h1 className="heading-primary">Shopping List for {`${mode}: ${name}`}</h1>

                    <ul className={styles.ingredientsList}>
                        {Object.keys(ingredientsList.validatedIngredients).map((ingredientName, index) => {
                            const ingredient = ingredientsList.validatedIngredients[ingredientName];
                            return <li key={index} className={styles.ingredientListItem}>
                                <>
                                    <span className={styles.ingredientAmount}>
                                        {`${ingredient.quantity} ${getFormattedUnitLabel(ingredient.quantity, ingredient.standardUnit, standardMeasurements)} `}
                                    </span>
                                    <span className={styles.ingredientText}>
                                        {(ingredient.quantity > 1 && !ingredient.standardUnit && standardIngredients) ? 
                                            standardIngredients[ingredientName].plural : ingredientName}
                                    </span>
                                </>
                            </li>
                        })}
                    </ul>

                    <h2 className="heading-tertiary">Miscellaneous Ingredients:</h2>

                    <ul className={styles.ingredientsList}>
                        {ingredientsList.miscellaneous.map((ingredientText, index) => (
                            <li key={index} className={styles.ingredientListItem}>
                                {ingredientText}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    )
}

function getFormattedUnitLabel(
    quantity: number,
    unit: string | null,
    standardMeasurements: StandardMeasurements | null
): string {
    if (!unit) return "";
    if (quantity > 1 && standardMeasurements && standardMeasurements[unit].plural) {
        return standardMeasurements[unit].plural[0];
    }
    return unit;
}