import type { Params } from 'react-router-dom';
import type { User } from '../../api/types/user';
import { StandardIngredients, StandardMeasurements, StandardLookupTable, StandardIngredientsGroupedByCategory,
    FlattenedStandardIngredientsForFuse, FlattenedStandardMeasurementsForFuse,
    IngredientForms,
    IngredientPreparations,
    Categories,
    Tags
} from '../../api/types/standardized';
import { getUserInfo } from '../../api/queries/usersApi';
import { getStaticFiles, StaticFilesData } from '../../api/queries/staticApi';
import { flattenDataForFuse } from '../../utils/helpers';

interface LoaderArgs {
    params: Params
}

export interface RootLoaderResult {
    user: User | null;
    standardIngredients: StandardIngredients | null;
    standardMeasurements: StandardMeasurements | null;
    standardIngredientsLookupTable: StandardLookupTable | null;
    standardMeasurementsLookupTable: StandardLookupTable | null;
    stardardIngredientsGroupedByCategory: StandardIngredientsGroupedByCategory | null;
    flattenedStandardIngredientsForFuse: FlattenedStandardIngredientsForFuse | null;
    flattenedStandardMeasurementsForFuse: FlattenedStandardMeasurementsForFuse | null;
    rawIngredientsList: string[] | null;
    rawIngredientsSet: Set<string> | null;
    rawUnitsList: string[] | null;
    allIngredientForms: IngredientForms | null;
    allIngredientPreparations: IngredientPreparations | null;
    categories: Categories | null;
    tags: Tags | null;
}

export async function rootLoader({ params }: LoaderArgs): Promise<RootLoaderResult> {
    let user = null;
    let standardIngredients = null;
    let standardMeasurements = null;
    let standardIngredientsLookupTable = null;
    let standardMeasurementsLookupTable = null;
    let stardardIngredientsGroupedByCategory = null;
    let flattenedStandardIngredientsForFuse = null;
    let flattenedStandardMeasurementsForFuse = null;
    let rawIngredientsList = null;
    let rawIngredientsSet = null;
    let rawUnitsList = null;
    let allIngredientForms = null;
    let allIngredientPreparations = null;
    let categories = null;
    let tags = null;

    await getUserInfo()
        .then(response => {
            user = response;
        })
        .catch(err => {
            if (err.status) {
                // Do nothing, there is just no user logged in.
            } else {
                console.log(err);
            }
        })

    await getStaticFiles()
        .then(data => {
            standardIngredients = data.standardIngredients;
            standardMeasurements = data.standardMeasurements;
            standardIngredientsLookupTable = data.standardIngredientsLookupTable;
            standardMeasurementsLookupTable = data.standardMeasurementsLookupTable;
            stardardIngredientsGroupedByCategory = data.standardIngredientsGroupedByCategory;
            allIngredientForms = data.ingredientForms;
            allIngredientPreparations = data.ingredientPreparations;
            categories = data.categories;
            tags = data.tags;
        })
        .catch(err => {
            if (err.status) {
                // Do nothing as of now, but in the future, somehow imply that standardizing is disabled for ingredients and measurements
                // in new recipes.
                console.log(err)
            } else {
                console.log(err);
            }
        })

    // Reformat for compatibility with fuse searching
    if (standardIngredients) flattenedStandardIngredientsForFuse = flattenDataForFuse(standardIngredients, "ingredient");
    if (standardMeasurements) flattenedStandardMeasurementsForFuse = flattenDataForFuse(standardMeasurements, "measurement");
    if (flattenedStandardIngredientsForFuse) rawIngredientsList = flattenedStandardIngredientsForFuse.flatMap(ingredient => [
        ingredient.name,
        ingredient.plural,
        ...ingredient.aliases
    ]);
    if (rawIngredientsList) rawIngredientsSet = new Set(rawIngredientsList);
    if (flattenedStandardMeasurementsForFuse) rawUnitsList = flattenedStandardMeasurementsForFuse.flatMap(units => [
        units.name,
        units.plural,
        ...units.symbol,
        ...units.aliases
    ]);
    
    return {
        user,
        standardIngredients,
        standardMeasurements,
        standardIngredientsLookupTable,
        standardMeasurementsLookupTable,
        stardardIngredientsGroupedByCategory,
        flattenedStandardIngredientsForFuse,
        flattenedStandardMeasurementsForFuse,
        rawIngredientsList,
        rawIngredientsSet,
        rawUnitsList,
        allIngredientForms,
        allIngredientPreparations,
        categories,
        tags
    }
}