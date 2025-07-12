import { parse as fallbackParse } from 'recipe-ingredient-parser-v3';
import { IngredientForms, IngredientPreparations, StandardLookupTable, StandardMeasurements } from '../api/types/standardized';

function isLikelyUnit(word: string, unitsList: string[]): boolean {
  return unitsList.includes(word.toLowerCase());
}

function isLikelyAmount(word: string): boolean {
  return /^\d+$|^\d+\/\d+$|^\d+\.\d+$/.test(word); // whole, fraction, decimal
}

const OPTIONAL_QUANTITY_PHRASES = [
    "optional",
    "or as needed",
    "to taste",
    "as needed",
    "or more",
    "as desired"
];

function stripOptionalQuantityPhrases(input: string): { cleaned: string; wasOptional: boolean } {
    let cleaned = input;
    let wasOptional = false;

    for (const phrase of OPTIONAL_QUANTITY_PHRASES) {
        const pattern = new RegExp(`\\b${phrase}\\b`, 'gi');
        if (pattern.test(cleaned)) {
            cleaned = cleaned.replace(pattern, '').trim();
            wasOptional = true;
        }
    }

    return { cleaned, wasOptional };
}

function parseFraction(input: string): number {
    if (!input) return 0;
    const parts = input.trim().split(' ');
    let total = 0;

    for (const part of parts) {
        if (part.includes('/')) {
            const [num, denom] = part.split('/').map(Number);
            if (!isNaN(num) && !isNaN(denom)) total += num / denom;
        } else {
            const value = parseFloat(part);
            if (!isNaN(value)) total += value;
        }
    }

    return total;
}

function extractQuantityAndRest(tokens: string[]): { quantity?: number, rest: string[] } {
    const joined = tokens.join(' ');

    // === Normalize Unicode fractions (e.g., ½ → 1/2)
    const unicodeFractions: { [key: string]: string } = {
        '½': '1/2',
        '⅓': '1/3',
        '⅔': '2/3',
        '¼': '1/4',
        '¾': '3/4',
        '⅕': '1/5',
        '⅖': '2/5',
        '⅗': '3/5',
        '⅘': '4/5',
        '⅙': '1/6',
        '⅚': '5/6',
        '⅛': '1/8',
        '⅜': '3/8',
        '⅝': '5/8',
        '⅞': '7/8'
    };

    const normalizeFractions = (input: string) => {
        return input
            .replace(/[\u00BC-\u00BE\u2150-\u215E]/g, (match) => unicodeFractions[match] || match)
            .replace(/–|—/g, "-"); // normalize en/em dash to hyphen
    };

    const normalized = normalizeFractions(joined);

    // === Handle ranges like "1/4 to 1/2", "1–2", "1 - 2", etc.
    const rangeMatch = normalized.match(
        /(\d+(?:\s+\d+\/\d+|\.\d+|\/\d+)?)[\s]*[-to]+[\s]*(\d+(?:\s+\d+\/\d+|\.\d+|\/\d+)?)/i
    );

    if (rangeMatch) {
        const minRaw = rangeMatch[1];
        const maxRaw = rangeMatch[2];

        const min = parseFraction(minRaw);
        const max = parseFraction(maxRaw);

        if (!isNaN(min) && !isNaN(max)) {
            const average = (min + max) / 2;
            const rangeStr = rangeMatch[0];

            const rest = normalized.replace(rangeStr, '').trim().split(/\s+/);
            return { quantity: average, rest };
        }
    }

    // === Handle normal + Unicode mixed numbers
    const quantityTokens: string[] = [];
    const normalizedTokens = normalizeFractions(tokens.join(' ')).split(/\s+/);
    while (normalizedTokens.length && isLikelyAmount(normalizedTokens[0])) {
        quantityTokens.push(normalizedTokens.shift()!);
    }

    const quantity = quantityTokens.length > 0
        ? parseFraction(quantityTokens.join(' '))
        : undefined;

    return { quantity, rest: normalizedTokens };
}

function extractAndStandardizeUnit(tokens: string[], unitsList: string[], standardMeasurementsLookupTable: StandardLookupTable): string | undefined {
    let unit: string | undefined = undefined;
    if (tokens.length && isLikelyUnit(tokens[0], unitsList)) {
        const extractedUnit = tokens.shift();
        if (extractedUnit) unit = standardMeasurementsLookupTable[extractedUnit];
    }
    return unit;
}

export function extractFormAndPreparation(
    input: string,
    formList: string[],
    preparationList: string[]
): {
    cleanedInput: string;
    forms?: string[];
    preparations?: string[];
} {
    const lowerInput = input.toLowerCase().trim();
    const words = lowerInput.split(/\s+/);
    const formSet = new Set(formList.map(f => f.toLowerCase()));
    const prepSet = new Set(preparationList.map(p => p.toLowerCase()));

    const usedIndexes = new Set<number>();
    const forms: string[] = [];
    const preparations: string[] = [];

    const conjunctions = new Set(["and", "or", ",", ";"]);

    // 1. Match multi-word preparations
    for (let i = 0; i < words.length; i++) {
        prepSet.forEach(prep => {
            const prepWords = prep.split(" ");
            const segment = words.slice(i, i + prepWords.length).join(" ");
            if (segment === prep) {
                preparations.push(prep);
                for (let j = i; j < i + prepWords.length; j++) usedIndexes.add(j);
                i += prepWords.length - 1;
            }
        })
    }

    // 2. Match multi-word or single-word forms
    for (let i = 0; i < words.length; i++) {
        if (usedIndexes.has(i)) continue;
        formSet.forEach(form => {
            const formWords = form.split(" ");
            const segment = words.slice(i, i + formWords.length).join(" ");
            if (segment === form) {
                forms.push(form);
                for (let j = i; j < i + formWords.length; j++) usedIndexes.add(j);
                i += formWords.length - 1;
            }
        })
    }

    // 3. Build remaining cleaned input (ingredient name)
    const cleanedWords = words.filter(
        (word, i) => !usedIndexes.has(i) && !conjunctions.has(word)
    );

    return {
        cleanedInput: cleanedWords.join(" ").trim(),
        forms: forms.length ? Array.from(new Set(forms)) : [],
        preparations: preparations.length ? Array.from(new Set(preparations)) : []
    };
}


export interface ParsedIngredient {
    optionalQuantity?: boolean;
    quantity?: number;
    unit?: string;
    ingredient: string;
    forms?: string[];
    preparations?: string[];
    size?: "small" | "medium" | "large";
    raw: string;
    parsedBy: 'manual' | 'fallback' | 'initialized';
}

export function parseIngredientLine(
    line: string,
    unitsList: string[],
    standardMeasurementsLookupTable: StandardLookupTable,
    allForms: IngredientForms,
    allPreparations: IngredientPreparations
): ParsedIngredient {
    const raw = line.trim();

    const { cleaned, wasOptional } = stripOptionalQuantityPhrases(raw);
    const tokens = cleaned.split(/\s+/);

    const { quantity, rest } = extractQuantityAndRest(tokens);

    const unit: string | undefined = extractAndStandardizeUnit(
        rest,
        unitsList,
        standardMeasurementsLookupTable
    );

    // === Extract size descriptor
    const sizeDescriptors = new Set(['small', 'medium', 'large']);
    let size: 'small' | 'medium' | 'large' | undefined;

    if (rest.length && sizeDescriptors.has(rest[0].toLowerCase())) {
        size = rest.shift()?.toLowerCase() as 'small' | 'medium' | 'large';
    }

    let { cleanedInput, forms, preparations } = extractFormAndPreparation(
        rest.join(' ').trim(),
        allForms,
        allPreparations
    );

     // Check if size appears after the ingredient name (e.g., "1 onion, medium, chopped")
    if (!size && cleanedInput.includes(',')) {
        const parts = cleanedInput.split(',').map(part => part.trim());
        for (let i = 1; i < parts.length; i++) {
            const part = parts[i].toLowerCase();
            if (sizeDescriptors.has(part)) {
                size = part as 'small' | 'medium' | 'large';
                parts.splice(i, 1); // remove size from parts
                break;
            }
        }
        cleanedInput = parts[0]; // use base name as ingredient
    }

    // Final cleanup in case of dangling comma
    const ingredient = cleanedInput.replace(/,\s*$/, '').trim();

    const hasValidIngredient = ingredient.length > 0;
    const hasValidQuantity = quantity !== undefined;

    if (!hasValidQuantity && hasValidIngredient) {
        return {
            ingredient,
            unit,
            forms,
            preparations,
            size,
            raw,
            parsedBy: 'manual',
            optionalQuantity: true
        };
    }

    if (!hasValidIngredient) {
        const fallback = fallbackParse(raw, 'eng');
        return {
            quantity: fallback.quantity !== undefined ? parseFloat("" + fallback.quantity) : undefined,
            unit: fallback.unit || undefined,
            ingredient: fallback.ingredient || '',
            raw,
            parsedBy: 'fallback'
        };
    }

    return {
        optionalQuantity: wasOptional,
        quantity,
        unit,
        ingredient,
        forms,
        preparations,
        size,
        raw,
        parsedBy: 'manual'
    };
}