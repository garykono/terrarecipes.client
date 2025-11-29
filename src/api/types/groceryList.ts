export interface CombinedIngredient {
    standardConversionUnit: {
        name: string,
        type: string
    },
    mainCategory: string,
    requiredStandardQuantity: number,
    optionalStandardQuantity: number,
    hasArbitraryOptionalAmount: boolean,
    normalizedRequiredUnitQuantity: number,
    normalizedOptionalUnitQuantity: number,
    normalizedUnit: string,
    name: string
}

export interface CategorizedIngredients {
    standardizedIngredients: {
        [key: string]: CombinedIngredient[];
    },
    miscellaneousIngredients: string[];
}

export interface GroceryList {
    name: string;
    categorizedIngredients: CategorizedIngredients;
}