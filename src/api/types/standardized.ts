/* -- STANDARDIZED INGREDIENTS -- */

export interface StandardIngredient {
    name: string;
    plural: string;
    needsUnit: boolean;
    standardUnit?: string;
    acceptableMassUnits: string[];
    acceptableVolumeUnits: string[];
    acceptableCountUnits: string[];
    category: string;
}

// An object used for quick ingredient lookups with format: [name of ingredient]: info about ingredient
export interface StandardIngredients {
    [key: string]: StandardIngredient;
}

export interface StandardIngredientsGroupedByCategory {
    [key: string]: StandardIngredients[];
}

export type FlattenedStandardIngredientsForFuse = StandardIngredient[];

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