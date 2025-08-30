import { StandardIngredientType } from "../../api/types/standardized";
import { Unit } from "./units";

export type Family = 'volume' | 'mass' | 'count';

export interface StandardUnit {
    name: string;
    type: StandardIngredientType
}

export interface ValidatedIngredient {
    standardConversionUnit: Unit | null;
    mainCategory: string;
    requiredStandardQuantity: number;
    optionalStandardQuantity: number;
    hasOptionalIngredientInThisList: boolean;
}

export interface NormalizedIngredient extends ValidatedIngredient {
    normalizedRequiredUnitQuantity: number;
    normalizedRequiredUnit: Unit | null;
}

export interface NormalizedAndNamedIngredient extends NormalizedIngredient {
    name: string;
}

/* Conversions */
export type UnitConversionTable = {
    [from in Unit]?: {
        [to in Unit]?: number;
    };
};

export type ConversionsMap = Record<string, number>;

/* Thresholds */
export type DisplayThresholds = {
    [unit in Unit]?: { to: Unit; threshold: number }
};
