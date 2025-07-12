/* -- STANDARDIZED INGREDIENTS -- */

export interface StandardIngredient {
    name: string;
    standardUnit?: string;
    acceptableMassUnits: string[];
    acceptableVolumeUnits: string[];
    acceptableCountUnits: string[];
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