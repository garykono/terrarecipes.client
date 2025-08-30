import { Ingredient } from "../../api/types/recipe";
import { StandardIngredient, StandardIngredients, StandardLookupTable, StandardMeasurements } from "../../api/types/standardized";
import { logger } from "../logger";
import { convertAnyUnit } from "./convert/convert-any";
import { normalizeAndRoundDisplayUnit } from "./display/normalize";
import { NormalizedAndNamedIngredient, NormalizedIngredient, StandardUnit, ValidatedIngredient } from "./types";
import { Unit } from "./units";

const DEBUG = false;

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
    standardMeasurements: StandardMeasurements | null;
    standardMeasurementsLookupTable: StandardLookupTable | null;
}

export function combineIngredients({ 
    uncombinedIngredients, 
    standardIngredients,
    standardIngredientsLookupTable,
    standardMeasurements,
    standardMeasurementsLookupTable
    } : CombineIngredientsProps) {
    let successfulAttemptsToCombine = 0;
    let totalAttemptsToCombine = 0;

    // If tools for standardizing are missing, return a list of unparsed ingredient lines
    if (!standardIngredients || !standardIngredientsLookupTable || !standardMeasurements || !standardMeasurementsLookupTable) {
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
            
            const standardConversionUnitName = standardMeasurementsLookupTable[ingredientInfo.standardConversionUnit];
            const standardConversionUnitInfo = standardMeasurements[standardConversionUnitName];
            /* This is the unit that all instances of this ingredient in the uncombined ingredients list will be converted -TO-
            in order to combine them */
            let standardConversionUnit : StandardUnit | undefined;
            
            if (standardConversionUnitName && standardConversionUnitInfo) {
                standardConversionUnit = {
                    name: standardConversionUnitName,
                    type: standardConversionUnitInfo.type
                }
            }

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
                if (standardConversionUnit) {
                    if (!parsedUnit) {
                        if (DEBUG) logger.debug("This ingredient must be converted to a standard unit but no parsed unit was given. Adding to miscellaneous.");
                        validatedIngredients.miscellaneous.push(parsedIngredientRawText);
                        return;
                    }

                    // Do a lookup to get the parsed measurement unit's standard name
                    // This is the unit that we are converting -FROM- for this instance of the ingredient
                    let standardNameOfParsedUnit = standardMeasurementsLookupTable[parsedUnit];

                    // Convert ounce to fluid ounce in the case that that is what this ingredient should default to
                    if (standardNameOfParsedUnit === "ounce" && ingredientInfo.treatOuncesAsVolume) {
                        standardNameOfParsedUnit = "fluid ounce";
                    }

                    /* THIS IS WHERE THE NEW CONVERSION LOGIC GOES */
                    //1) Find the type of the parsed unit's measurement
                    let standardParsedUnitMeasurementInfo = standardMeasurements[standardNameOfParsedUnit];

                    let standardParsedUnit : StandardUnit | undefined;
                    if (standardNameOfParsedUnit && standardParsedUnitMeasurementInfo) {
                        standardParsedUnit = {
                            name: standardNameOfParsedUnit,
                            type: standardParsedUnitMeasurementInfo.type
                        }
                    }
                    if (!standardParsedUnit) {
                        if (DEBUG) logger.debug("Could not find a standardized unit match for parsed unit. Adding to miscellaneous.");
                            validatedIngredients.miscellaneous.push(parsedIngredientRawText);
                        return;
                    }

                    // convert to standard unit
                    if (DEBUG) logger.debug("standard unit: ", standardParsedUnit)
                        try {
                            convertedUnitAmount = convertAnyUnit(parsedQuantity, standardParsedUnit, standardConversionUnit, ingredientInfo);
                            if (DEBUG) logger.debug(`conversion successful.`);
                        } catch (e) {
                            logger.debug(e, " Adding to miscellaneous.")
                            validatedIngredients.miscellaneous.push(parsedIngredientRawText);
                            return;
                        }
                } else {
                    if (DEBUG) logger.debug(`${parsedIngredientName} doesn't have a standard conversion unit.`)
                }
            }            

            // Calculate the standard quantity
            const validatedAndStandardizedIngredientsList = validatedIngredients.standardizedIngredients;
            if (!validatedAndStandardizedIngredientsList[standardName]) {
                validatedAndStandardizedIngredientsList[standardName] = {
                    standardConversionUnit: ingredientInfo.standardConversionUnit as Unit,
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
                updatedStandardUnitAmount;

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
    console.log("standardized ingredients: ", validatedIngredients)
    Object.keys(validatedIngredients.standardizedIngredients).forEach(ingredientName => {
        const validatedIngredient = validatedIngredients.standardizedIngredients[ingredientName];
        const listAddedTo = combinedIngredients.standardizedIngredients;
        normalizeAndAddStandardizedIngredient(standardIngredients[ingredientName], validatedIngredient, listAddedTo)
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
    ingredientInfo: StandardIngredient, 
    validatedIngredient: ValidatedIngredient, 
    listAddedTo: {
        [key: string]: {}
    }
) {
    // For now, only normalize and round for the required amounts
    const { normalizedUnitQuantity, normalizedUnit } = normalizeAndRoundDisplayUnit(
        ingredientInfo,
        validatedIngredient.requiredStandardQuantity, 
        validatedIngredient.standardConversionUnit
    );
    if (DEBUG) {
        logger.debug(`${ingredientInfo.name} normalization: 
            ${validatedIngredient.requiredStandardQuantity} ${validatedIngredient.standardConversionUnit} => ${normalizedUnitQuantity} ${normalizedUnit}`);
    }
    listAddedTo[ingredientInfo.name] = {
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







