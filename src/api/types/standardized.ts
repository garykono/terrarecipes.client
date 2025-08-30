/* -- STANDARDIZED INGREDIENTS -- */

export interface StandardIngredient {
    name: string;
    plural: string;
    aliases: string[];
    categories: string[];
    forms: string[];
    defaultForm: string;
    substitutes: string[];
    intensity: string;
    storage: string;
    shelfLifeMonths: number;
    commonPreparations: string[];
    notes: string;
    tags: string[];
    averagePriceUSDPerUnit: number;
    treatOuncesAsVolume: boolean;
    standardConversionUnit: string;
    standardCountUnit: string;
    conversions: {
        countConversions: {
            [key: string]: number
        }
        crossConversions: {
            [key: string]: number
        }
        crossConversionsByForm: {
            [key: string]: {
                [key: string]: number
            }
        }
        trueValues: null;
    }
    mainCategory: string;
}

// An object used for quick ingredient lookups with format: [name of ingredient]: info about ingredient
export interface StandardIngredients {
    [key: string]: StandardIngredient;
}

export interface StandardIngredientsGroupedByCategory {
    [key: string]: StandardIngredients[];
}

export type FlattenedStandardIngredientsForFuse = StandardIngredient[];


/* -- INGREDIENT FORMS AND PREPARATIONS -- */
export type IngredientForms = string[];

export type IngredientPreparations = string[];


/* -- STANDARDIZED MEASUREMENTS -- */
export type StandardIngredientType = "mass" | "volume" | "count";

export interface StandardMeasurement {
    name: string;
    plural: string;
    symbol: string[];
    aliases: string[];
    type: StandardIngredientType;
}

export interface StandardMeasurements {
    [key: string]: StandardMeasurement;
};

export type FlattenedStandardMeasurementsForFuse = StandardMeasurement[];

/* -- GENERAL -- */

export type StandardLookupTable = {
    [key: string]: string;
};

export interface Category {
    title: string,
    icon: string,
    description: string,
    slug: string,
    searchTags: string[];
}

export interface Categories {
    core: Category[],
    featured: Category[]
}