import { StandardIngredient } from "../../../api/types/standardized";
import { logger } from "../../logger";
import { unitConversionTable } from "../convert/unit-tables";
import { Unit } from "../units";
import { unitDisplayThresholds, unitDowngradeThresholds } from "./thresholds";

// NEW imports:
import { chooseDisplayUnit, Totals } from "./choose-display-unit";

const DEBUG = false;

/**
 * Adapter: given an ingredient's STANDARD amount (in its standardConversionUnit),
 * pick the best display unit with chooseDisplayUnit, then normalize (upgrade/downgrade chain)
 * and snap to kitchen-friendly fractions.
 */
export function normalizeAndRoundDisplayUnit(
    ingredientInfo: StandardIngredient,
    amountInStandard: number,
    _unitIgnored: Unit | null // kept for backward compatibility; not used anymore
): { normalizedUnitQuantity: number; normalizedUnit: Unit | null } {
    // 1) Build totals (anchors) from the standardConversionUnit
    const totals = buildTotalsFromStandard(ingredientInfo, amountInStandard);

    // 2) Choose the most human-friendly unit/value
    const { unit: chosenUnit, value: chosenValue } = chooseDisplayUnit(ingredientInfo, totals);

    // 3) Apply your existing upgrade/downgrade chain to polish the chosen unit/value
    const { normalizedUnitQuantity, normalizedUnit } =
        polishWithThresholds(chosenValue, chosenUnit);

    return { normalizedUnitQuantity, normalizedUnit };
}

/** Build the anchors object expected by chooseDisplayUnit from the ingredient's standardConversionUnit. */
function buildTotalsFromStandard(ingredientInfo: StandardIngredient, amount: number): Totals {
    const std = ingredientInfo.standardConversionUnit;
    if (!std) return {};

    // Standard is mass
    if (std === 'gram' || std === 'kilogram' || std === 'ounce' || std === 'pound') {
        const grams = std === 'gram' ? amount : convertSameTypeSafe(amount, std, 'gram');
        return { gram: grams };
    }

    // Standard is volume
    if (std === 'milliliter' || std === 'liter' || std === 'teaspoon' || std === 'tablespoon' || std === 'cup' || std === 'fluid ounce') {
        const mL = std === 'milliliter' ? amount : convertSameTypeSafe(amount, std, 'milliliter');
        return { milliliter: mL };
    }

    // Otherwise treat as count (standardCountUnit)
    return { countStd: amount };
}

/** Uses your unitConversionTable with a clear error if no path exists. */
function convertSameTypeSafe(amount: number, from: Unit, to: Unit): number {
    if (from === to) return amount;

    const direct = unitConversionTable[from]?.[to];
    if (direct) return amount * direct;

    const mids = unitConversionTable[from];
    if (!mids) throw new Error(`No conversion path from ${from}`);

    for (const mid in mids) {
        const toMid = unitConversionTable[from]?.[mid as Unit];
        const midTo = unitConversionTable[mid as Unit]?.[to];
        if (toMid && midTo) return amount * toMid * midTo;
    }

    throw new Error(`No conversion path from ${from} to ${to}`);
}

/** Your existing polishing step (upgrade/downgrade chain + fraction snap), factored out for reuse. */
function polishWithThresholds(
    amount: number,
    unit: Unit
): { normalizedUnitQuantity: number; normalizedUnit: Unit } {
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

        if (DEBUG) logger.debug(`converted ${currentAmount} ${currentUnit} => ${currentAmount * conversionRate} ${to}`);
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

        if (DEBUG) logger.debug(`converted ${currentAmount} ${currentUnit} => ${currentAmount * conversionRate} ${to}`);
        currentAmount = currentAmount * conversionRate;
        currentUnit = to;
    }

    const roundedAmount = roundToCommonFraction(currentAmount);
    return { normalizedUnitQuantity: roundedAmount, normalizedUnit: currentUnit };
}

function roundToCommonFraction(value: number): number {
    const fractions = [0, 0.25, 0.5, 0.75, 1];
    const integer = Math.floor(value);
    const decimal = value - integer;
    const closest = fractions.reduce((prev, curr) =>
        Math.abs(curr - decimal) < Math.abs(prev - decimal) ? curr : prev
    );
    return +(integer + closest).toFixed(2);
}