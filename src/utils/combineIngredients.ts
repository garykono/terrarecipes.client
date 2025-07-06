import { Ingredient } from "../api/types/recipe";
import { StandardIngredients, StandardLookupTable, StandardMeasurements } from "../api/types/standardized";
import { logger } from "./logger";

type VolumeUnit = 'teaspoon' | 'tablespoon' | 'cup' | 'milliliter' | 'liter';
type WeightUnit = 'gram' | 'kilogram' | 'ounce' | 'pound';
type Unit = VolumeUnit | WeightUnit;

interface ValidatedIngredient {
    quantity: number,
    standardUnit: Unit | null
}

export interface CombinedIngredients {
    validatedIngredients: {
        [key: string]: ValidatedIngredient
    },
    miscellaneous: string[]
}

export interface CombineIngredientsProps {
    uncombinedIngredients: Ingredient[]; 
    standardIngredients: StandardIngredients | null;
    standardIngredientsLookupTable: StandardLookupTable | null;
    standardMeasurementsLookupTable: StandardLookupTable | null;
}

export function combineIngredients({ 
    uncombinedIngredients, 
    standardIngredients,
    standardIngredientsLookupTable,
    standardMeasurementsLookupTable
    } : CombineIngredientsProps) {

    const combinedIngredients = {
        validatedIngredients: {},
        miscellaneous: []
    } as CombinedIngredients;

    // If tools for standardizing are missing, return a list of unparsed ingredient lines
    if (!standardIngredients || !standardIngredientsLookupTable || !standardMeasurementsLookupTable) {
        uncombinedIngredients.map(ingredient => {
            combinedIngredients["miscellaneous"].push(ingredient.text);
        });
        logger.error("Missing one or more standardized lists. All ingredients set to miscellaneous.")
        return combinedIngredients;
    }

    uncombinedIngredients.forEach(ingredient => {
        if (!ingredient.parsed) {
            logger.debug(ingredient.text, " was never parsed. Try to parse in future, but for now, adding to miscellaneous list.");
            combinedIngredients.miscellaneous.push(ingredient.text);
            return;
        }
        
        logger.debug("ingredient: ", ingredient)
        const parsedQuantity = ingredient.parsed.quantity;
        const parsedUnit = ingredient.parsed.unit;
        const parsedIngredientName = ingredient.parsed.ingredient;

        // Get the ingredient's standard name
        const standardName = standardIngredientsLookupTable[parsedIngredientName];

        if (!standardName) {
            logger.debug("Couldn't find ingredient name (including its aliases) in standardized list. Adding to miscellaneous.")
            combinedIngredients.miscellaneous.push(ingredient.text);
            return;
        }

        // Get the ingredient's standard measurement unit
        const ingredientInfo = standardIngredients[standardName];
        logger.debug("standard ingredient's info: ", ingredientInfo)
        const standardUnit = ingredientInfo.standardUnit as Unit;

        if (!parsedQuantity || !parsedIngredientName) {
            logger.debug("This ingredient is missing a parsed field, so no conversion possible. Adding to miscellaneous ingredients.")
            combinedIngredients.miscellaneous.push(ingredient.text);
            return;
        }
        
        let convertedUnitAmount = parsedQuantity;
        if (standardUnit) {
            if (!parsedUnit) {
                logger.debug("This ingredient must be converted to a standard unit but no parsed unit was given. Adding to miscellaneous.");
                combinedIngredients.miscellaneous.push(ingredient.text);
                return;
            }

            // Do a lookup to get the parsed measurement unit's standard name
            let standardNameOfParsedUnit = standardMeasurementsLookupTable[parsedUnit] as Unit;

            // convert to standard unit
            logger.debug("standard unit: ", standardUnit)
                try {
                    convertedUnitAmount = convertSameType(parsedQuantity, standardNameOfParsedUnit, standardUnit);
                    logger.debug(`converted units: from ${parsedQuantity} ${parsedUnit} -> ${convertedUnitAmount} ${standardUnit})`);
                } catch (e) {
                    logger.error(e)
                }
        } else {
            logger.debug(`${parsedIngredientName} didn't have a standard unit, so it is already converted!`)
        }

        // Update new ingredients list with the standardized amount for this ingredient entry
        const currentStandardIngredient = combinedIngredients.validatedIngredients[standardName];
        logger.debug("previous amount: ", currentStandardIngredient?.quantity || 0)
        logger.debug("new amount: ", (currentStandardIngredient?.quantity || 0) + convertedUnitAmount)
        combinedIngredients.validatedIngredients[standardName] = {
            quantity: (currentStandardIngredient?.quantity || 0) + convertedUnitAmount,
            standardUnit
        }
    })
    logger.debug("final combined ingredients list: ", combinedIngredients)

    return combinedIngredients;
}

type UnitConversionTable = {
    [from in Unit]?: {
        [to in Unit]?: number;
    };
};

const unitConversionTable: UnitConversionTable = {
    // volume
    teaspoon: { tablespoon: 1 / 3, cup: 1 / 48, milliliter: 4.92892 },
    tablespoon: { teaspoon: 3, cup: 1 / 16, milliliter: 14.7868 },
    cup: { teaspoon: 48, tablespoon: 16, milliliter: 240 },
    milliliter: { teaspoon: 1 / 4.92892, tablespoon: 1 / 14.7868, cup: 1 / 240 },
    liter: { milliliter: 1000 },

    // weight
    gram: { kilogram: 0.001, ounce: 1 / 28.3495, pound: 1 / 453.592 },
    kilogram: { gram: 1000 },
    ounce: { gram: 28.3495, pound: 1 / 16 },
    pound: { gram: 453.592, ounce: 16 }
};

function convertSameType(amount: number, from: Unit, to: Unit): number {
    if (from === to) return amount;

    const direct = unitConversionTable[from]?.[to];
    if (direct) return amount * direct;

    // Try indirect path (e.g., tbsp → ml → cup)
    const intermediates = unitConversionTable[from];
    if (!intermediates) throw new Error(`No conversion path from ${from}`);

    for (const intermediate in intermediates) {
        const midUnit = intermediate as Unit;
        const toMid = unitConversionTable[from]?.[midUnit];
        const fromMid = unitConversionTable[midUnit]?.[to];
        if (toMid && fromMid) {
            return amount * toMid * fromMid;
        }
    }

    throw new Error(`No conversion path from ${from} to ${to}`);
}


