import { getStaticFiles, StaticFilesData } from "../api/queries/staticApi";
import { 
    Categories, 
    FlattenedStandardIngredientsForFuse, 
    FlattenedStandardMeasurementsForFuse, 
    IngredientForms, 
    IngredientPreparations, 
    StandardIngredients, 
    StandardIngredientsGroupedByCategory, 
    StandardLookupTable, 
    StandardMeasurements,
    StandardTags, 
} from "../api/types/standardized";
import { flattenDataForFuse } from "../utils/helpers";
import { log, logAPI } from "../utils/logger";


export interface StaticBootstrapState {
    standardIngredients: StandardIngredients | null;
    standardMeasurements: StandardMeasurements | null;
    standardIngredientsLookupTable: StandardLookupTable | null;
    standardMeasurementsLookupTable: StandardLookupTable | null;
    standardIngredientsGroupedByCategory: StandardIngredientsGroupedByCategory | null;
    flattenedStandardIngredientsForFuse: FlattenedStandardIngredientsForFuse | null;
    flattenedStandardMeasurementsForFuse: FlattenedStandardMeasurementsForFuse | null;
    rawIngredientsSet: Set<string> | null;
    rawUnitsSet: Set<string> | null;
    allIngredientForms: IngredientForms | null;
    allIngredientPreparations: IngredientPreparations | null;
    categories: Categories | null;
    tags: StandardTags | null;
}

export async function buildStandardizedStaticState(): Promise<StaticBootstrapState> {
    let standardIngredients = null;
    let standardMeasurements = null;
    let standardIngredientsLookupTable = null;
    let standardMeasurementsLookupTable = null;
    let standardIngredientsGroupedByCategory = null;
    let allIngredientForms = null;
    let allIngredientPreparations = null;
    let categories = null;
    let tags = null;

    await getStaticFiles()
        .then(data => {
            standardIngredients = data.standardIngredients;
            standardMeasurements = data.standardMeasurements;
            standardIngredientsLookupTable = data.standardIngredientsLookupTable;
            standardMeasurementsLookupTable = data.standardMeasurementsLookupTable;
            standardIngredientsGroupedByCategory = data.standardIngredientsGroupedByCategory;
            allIngredientForms = data.ingredientForms;
            allIngredientPreparations = data.ingredientPreparations;
            categories = data.categories;
            tags = data.tags;
        })
        .catch(err => {
            logAPI.warn({ err }, "There was an issue loading some static resources.")
        })

    const flattenedStandardIngredientsForFuse = standardIngredients ? flattenDataForFuse(standardIngredients, "ingredient") : null;
    const flattenedStandardMeasurementsForFuse = standardMeasurements ? flattenDataForFuse(standardMeasurements, "measurement") : null;

    // Intermediary format to create ingredient and measurement sets
    const rawIngredientsList = flattenedStandardIngredientsForFuse
        ? flattenedStandardIngredientsForFuse.flatMap(ingredient => [
            ingredient.name,
            ingredient.plural,
            ...ingredient.aliases
        ])
        : null;
    const rawUnitsList = flattenedStandardMeasurementsForFuse 
        ? flattenedStandardMeasurementsForFuse.flatMap(units => [
            units.name,
            units.plural,
            ...units.symbol,
            ...units.aliases
        ])
        : null;

    let rawIngredientsSet = rawIngredientsList ? new Set(rawIngredientsList) : null;
    let rawUnitsSet = rawUnitsList ? new Set(rawUnitsList) : null;

    const staticFiles = {
        standardIngredients,
        standardMeasurements,
        standardIngredientsLookupTable,
        standardMeasurementsLookupTable,
        standardIngredientsGroupedByCategory,
        flattenedStandardIngredientsForFuse,
        flattenedStandardMeasurementsForFuse,
        rawIngredientsSet,
        rawUnitsSet,
        allIngredientForms,
        allIngredientPreparations,
        categories,
        tags
    };

    // Log failed static resources
    const failedStaticFiles = Object.keys(staticFiles).filter(key => !staticFiles[key as keyof typeof staticFiles]);
    if (failedStaticFiles && failedStaticFiles.length > 0) log.warn({ failedStaticFiles }, "Failed to load static resources.");

    return staticFiles;
}