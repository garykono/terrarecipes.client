import { Ingredient } from "../api/types/recipe";
import { StandardIngredients, StandardLookupTable, StandardMeasurements } from "../api/types/standardized";
import { logger } from "./logger";

const DEBUG = false;

type VolumeUnit = 'teaspoon' | 'tablespoon' | 'cup' | 'milliliter' | 'liter' | 'fluid ounce';
type WeightUnit = 'gram' | 'kilogram' | 'ounce' | 'pound';
type Unit = VolumeUnit | WeightUnit;

interface ValidatedIngredient {
    standardUnit: Unit | null;
    mainCategory: string;
    requiredStandardQuantity: number;
    optionalStandardQuantity: number;
    hasOptionalIngredientInThisList: boolean;
}

interface NormalizedIngredient extends ValidatedIngredient {
    normalizedRequiredUnitQuantity: number;
    normalizedRequiredUnit: Unit | null;
}

interface NormalizedAndNamedIngredient extends NormalizedIngredient {
    name: string;
}

export interface CombinedIngredients {
    standardizedIngredients: {
        [key: string]: NormalizedIngredient
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
    let successfulAttemptsToCombine = 0;
    let totalAttemptsToCombine = 0;

    // If tools for standardizing are missing, return a list of unparsed ingredient lines
    if (!standardIngredients || !standardIngredientsLookupTable || !standardMeasurementsLookupTable) {
        logger.error("Missing one or more standardized lists. All ingredients set to miscellaneous.")
        return {
            standardizedIngredients: {},
            miscellaneous: uncombinedIngredients.map(ingredient => ingredient.text)
        } as CombinedIngredients;
    }

    const validatedIngredients = {
        standardizedIngredients: {} as {
            [key: string]: ValidatedIngredient
        },
        miscellaneous: [] as string[]
    };

    uncombinedIngredients.forEach(ingredient => {
        totalAttemptsToCombine++;
        if (!ingredient.parsed) {
            if (DEBUG) logger.debug(`'${ingredient.text}' was never parsed. Try to parse in future, but for now, adding to miscellaneous list.`);
            validatedIngredients.miscellaneous.push(ingredient.text);
            return;
        }
        
        ingredient.parsed.forEach(parsedIngredient => {
            if (DEBUG) logger.debug("ingredient: ", parsedIngredient)
            const parsedQuantity = parsedIngredient.quantity;
            const parsedUnit = parsedIngredient.unit;
            const parsedIngredientName = parsedIngredient.ingredient;
            const parsedIngredientRawText = parsedIngredient.raw;
            const isOptional = parsedIngredient.isOptional ? true : false;
            const optionalQuantity = parsedIngredient.optionalQuantity;
            const isSubstitute = parsedIngredient.isSubstitute;

            // Ignore substitutions for now
            if (isSubstitute) return

            // Get the ingredient's standard name
            const standardName = standardIngredientsLookupTable[parsedIngredientName];

            if (!standardName) {
                if (DEBUG) logger.debug("Couldn't find ingredient name (including its aliases) in standardized list. Adding to miscellaneous.")
                validatedIngredients.miscellaneous.push(parsedIngredientRawText);
                return;
            }

            // Get the ingredient's standard measurement unit
            const ingredientInfo = standardIngredients[standardName];
            if (DEBUG) logger.debug("standard ingredient's info: ", ingredientInfo)
            const standardUnit = ingredientInfo.standardUnit as Unit;

            // Get the ingredient's main category
            const mainCategory = ingredientInfo.mainCategory;

            // If the quantity was not optional, calculate it. Otherwise, it will be treated as 0.
            let convertedUnitAmount = 0;
            if (!optionalQuantity) {
                // Convert to ingredient's standard unit
                if (!parsedIngredientName || !parsedQuantity) {
                    if (DEBUG) logger.debug("This ingredient is missing a parsed field, so no conversion possible. Adding to miscellaneous ingredients.")
                    validatedIngredients.miscellaneous.push(parsedIngredientRawText);
                    return;
                }
                
                convertedUnitAmount = parsedQuantity;
                if (standardUnit) {
                    if (!parsedUnit) {
                        if (DEBUG) logger.debug("This ingredient must be converted to a standard unit but no parsed unit was given. Adding to miscellaneous.");
                        validatedIngredients.miscellaneous.push(parsedIngredientRawText);
                        return;
                    }

                    // Do a lookup to get the parsed measurement unit's standard name
                    let standardNameOfParsedUnit = standardMeasurementsLookupTable[parsedUnit] as Unit;

                    // Convert ounce to fluid ounce in the case that that is what this ingredient should default to
                    if (standardNameOfParsedUnit === "ounce" && ingredientInfo.treatOuncesAsVolume) {
                        standardNameOfParsedUnit = "fluid ounce";
                    }

                    // convert to standard unit
                    if (DEBUG) logger.debug("standard unit: ", standardUnit)
                        try {
                            convertedUnitAmount = convertSameType(parsedQuantity, standardNameOfParsedUnit, standardUnit);
                            if (DEBUG) logger.debug(`converted units: from ${parsedQuantity} ${parsedUnit} -> ${convertedUnitAmount} ${standardUnit})`);
                        } catch (e) {
                            logger.error(e)
                            validatedIngredients.miscellaneous.push(parsedIngredientRawText);
                            return;
                        }
                } else {
                    if (DEBUG) logger.debug(`${parsedIngredientName} didn't have a standard unit, so it is already converted!`)
                }
            }            

            // Calculate the standard quantity
            const validatedAndStandardizedIngredientsList = validatedIngredients.standardizedIngredients;
            if (!validatedAndStandardizedIngredientsList[standardName]) {
                validatedAndStandardizedIngredientsList[standardName] = {
                    standardUnit,
                    mainCategory,
                    requiredStandardQuantity: 0,
                    optionalStandardQuantity: 0,
                    hasOptionalIngredientInThisList: false
                }
            }
            const previousStandardUnitAmount = isOptional 
                ?  validatedAndStandardizedIngredientsList[standardName].optionalStandardQuantity
                : validatedAndStandardizedIngredientsList[standardName].requiredStandardQuantity;
            const updatedStandardUnitAmount = previousStandardUnitAmount + convertedUnitAmount;

            if (isOptional) validatedAndStandardizedIngredientsList[standardName].hasOptionalIngredientInThisList = true;

            // Add/update entry for ingredient in appropriate list
            validatedAndStandardizedIngredientsList[standardName][isOptional ? 'optionalStandardQuantity' : 'requiredStandardQuantity'] = 
                previousStandardUnitAmount + updatedStandardUnitAmount;

            successfulAttemptsToCombine++;
            if (DEBUG) logger.debug(`'${parsedIngredientName}' was added as ${isOptional ? "optional" : "validated"} ingredient.`)
            if (DEBUG) logger.debug("previous amount: ", previousStandardUnitAmount)
            if (DEBUG) logger.debug("new amount: ", updatedStandardUnitAmount)
        })
    })
    
    // For each standardized ingredient, if the quantity is large for the standard unit, convert to a larger unit
    const combinedIngredients = {
        standardizedIngredients: {},
        miscellaneous: []
    } as CombinedIngredients;

    // Normalize and add standardized ingredients
    Object.keys(validatedIngredients.standardizedIngredients).forEach(ingredientName => {
        const validatedIngredient = validatedIngredients.standardizedIngredients[ingredientName];
        const listAddedTo = combinedIngredients.standardizedIngredients;
        normalizeAndAddStandardizedIngredient(ingredientName, validatedIngredient, listAddedTo)
    })

    // Copy miscellaneous ingredients array
    combinedIngredients.miscellaneous = [...validatedIngredients.miscellaneous];

    if (DEBUG) {
        logger.debug("final combined ingredients list: ", combinedIngredients)
        logger.debug("successful ingredient inputs able to be parsed and processed: ", successfulAttemptsToCombine);
        logger.debug("total attempts of processing ingredients: ", totalAttemptsToCombine)
        logger.debug("% of attempts successful: ", Math.round(successfulAttemptsToCombine / totalAttemptsToCombine * 100), "%")
    }

    return combinedIngredients;
}

function normalizeAndAddStandardizedIngredient(
    ingredientName: string, 
    validatedIngredient: ValidatedIngredient, 
    listAddedTo: {
        [key: string]: {}
    }
) {
    // For now, only normalize and round for the required amounts
    const { normalizedUnitQuantity, normalizedUnit } = normalizeAndRoundDisplayUnit(
        validatedIngredient.requiredStandardQuantity, 
        validatedIngredient.standardUnit
    );
    if (DEBUG) {
        logger.debug(`${ingredientName} normalization: 
            ${validatedIngredient.requiredStandardQuantity} ${validatedIngredient.standardUnit} => ${normalizedUnitQuantity} ${normalizedUnit}`);
    }
    listAddedTo[ingredientName] = {
        ...validatedIngredient,
        normalizedRequiredUnitQuantity: normalizedUnitQuantity,
        normalizedRequiredUnit: normalizedUnit
    }
}

export interface CategorizedAndCombinedIngredients {
    //category
    standardizedIngredients: {
        // Category
        [key: string]: NormalizedAndNamedIngredient[]
    };
    miscellaneousIngredients: string[];
}

export function categorizeAndCombineIngredients(combinedIngredients: CombinedIngredients) {
    const categorizedAndCombinedIngredients = {
        standardizedIngredients: {}
    } as CategorizedAndCombinedIngredients;
    Object.keys(combinedIngredients.standardizedIngredients).forEach(ingredientName => {
        const ingredientData = combinedIngredients.standardizedIngredients[ingredientName];
        const category = ingredientData.mainCategory;
        if (!categorizedAndCombinedIngredients.standardizedIngredients[category]) {
            categorizedAndCombinedIngredients.standardizedIngredients[category] = [];
        }

        categorizedAndCombinedIngredients.standardizedIngredients[category].push({
            ...ingredientData,
            name: ingredientName,
        })
    })
    categorizedAndCombinedIngredients.miscellaneousIngredients = combinedIngredients.miscellaneous;
    return categorizedAndCombinedIngredients;
}


type UnitConversionTable = {
    [from in Unit]?: {
        [to in Unit]?: number;
    };
};

const unitConversionTable: UnitConversionTable = {
    // volume
    teaspoon: {
        tablespoon: 1 / 3,
        cup: 1 / 48,
        milliliter: 4.92892,
        "fluid ounce": 1 / 6  // 1 fl oz = 6 tsp
    },
    tablespoon: {
        teaspoon: 3,
        cup: 1 / 16,
        milliliter: 14.7868,
        "fluid ounce": 1 / 2  // 1 fl oz = 2 tbsp
    },
    cup: {
        teaspoon: 48,
        tablespoon: 16,
        milliliter: 240,
        "fluid ounce": 8  // 1 cup = 8 fl oz
    },
    milliliter: {
        teaspoon: 1 / 4.92892,
        tablespoon: 1 / 14.7868,
        cup: 1 / 240,
        "fluid ounce": 1 / 29.5735  // 1 fl oz = 29.5735 ml
    },
    liter: {
        milliliter: 1000,
        "fluid ounce": 1000 / 29.5735
    },
    "fluid ounce": {
        teaspoon: 6,
        tablespoon: 2,
        cup: 1 / 8,
        milliliter: 29.5735,
        liter: 1 / (1000 / 29.5735)
    },

    // weight
    gram: {
        kilogram: 0.001,
        ounce: 1 / 28.3495,
        pound: 1 / 453.592
    },
    kilogram: {
        gram: 1000
    },
    ounce: {
        gram: 28.3495,
        pound: 1 / 16
    },
    pound: {
        gram: 453.592,
        ounce: 16
    }
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


type DisplayThresholds = {
    [unit in Unit]?: { to: Unit; threshold: number }
};

const unitDisplayThresholds: DisplayThresholds = {
    tablespoon: { to: 'cup', threshold: 16 },   // 16 tbsp = 1 cup
    teaspoon: { to: 'tablespoon', threshold: 3 },
    cup: { to: 'liter', threshold: 4 },          // 4 cups = 1 L (approx)
    "fluid ounce": { to: 'cup', threshold: 8 }, // 8 fluid oz = 1 cup
    gram: { to: 'kilogram', threshold: 1000 },
    ounce: { to: 'pound', threshold: 16 }
};

const unitDowngradeThresholds: DisplayThresholds = {
    tablespoon: { to: 'teaspoon', threshold: 1 },
    cup: { to: 'tablespoon', threshold: 1 },
    liter: { to: 'cup', threshold: 1 },
    kilogram: { to: 'gram', threshold: 0.5 },
    pound: { to: 'ounce', threshold: 0.5 },
};

function roundToCommonFraction(value: number): number {
    const fractions = [0, 0.25, 0.5, 0.75, 1];
    const integer = Math.floor(value);
    const decimal = value - integer;
    const closest = fractions.reduce((prev, curr) =>
        Math.abs(curr - decimal) < Math.abs(prev - decimal) ? curr : prev
    );
    return +(integer + closest).toFixed(2);
}

export function normalizeAndRoundDisplayUnit(
    amount: number,
    unit: Unit | null
): { normalizedUnitQuantity: number; normalizedUnit: Unit | null } {
    const DEBUG = false;

    if (!unit) {
        return {
            normalizedUnitQuantity: roundToCommonFraction(amount),
            normalizedUnit: unit
        };
    }

    let currentUnit = unit;
    let currentAmount = amount;

    // Upgrade to larger units if possible
    while (true) {
        const rule = unitDisplayThresholds[currentUnit];
        if (!rule) break;

        const { to, threshold } = rule;
        if (currentAmount < threshold) break;

        const conversionRate = unitConversionTable[currentUnit]?.[to];
        if (!conversionRate) break;

        if (DEBUG) logger.debug(`converted ${currentAmount} ${currentUnit} => ${currentAmount * conversionRate} ${to} `)
        currentAmount = currentAmount * conversionRate;
        currentUnit = to;
    }

    // Downgrade to smaller units if below threshold
    while (true) {
        const rule = unitDowngradeThresholds[currentUnit];
        if (!rule) break;

        const { to, threshold } = rule;
        if (currentAmount >= threshold) break;

        const conversionRate = unitConversionTable[currentUnit]?.[to];
        if (!conversionRate) break;

        if (DEBUG) logger.debug(`converted ${currentAmount} ${currentUnit} => ${currentAmount * conversionRate} ${to} `)
        currentAmount = currentAmount * conversionRate;
        currentUnit = to;
    }

    const roundedAmount = roundToCommonFraction(currentAmount);

    return {
        normalizedUnitQuantity: roundedAmount,
        normalizedUnit: currentUnit
    };
}


