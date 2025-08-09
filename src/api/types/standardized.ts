/* -- STANDARDIZED INGREDIENTS -- */

export interface StandardIngredient {
    name: string;
    acceptableMassUnits: string[];
    acceptableVolumeUnits: string[];
    acceptableCountUnits: string[];
    aliases: string[];
    averagePriceUSDPerUnit: number;
    categories: string[];
    commonPreparations: string[];
    defaultForm: string;
    forms: string[];
    intensity: string;
    mainCategory: string;
    notes: string;
    plural: string;
    shelfLifeMonths: number;
    standardUnit?: string;
    storage: string;
    substitutes: string[];
    tags: string[];
    treatOuncesAsVolume: boolean;
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

export interface StandardMeasurement {
    name: string;
    plural: string[]
    symbol: string[]
    aliases: string[]
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
    slug: string,
    icon: string,
    searchTags: string[];
}

export interface Categories {
    core: Category[],
    featured: Category[]
}