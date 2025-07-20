import { parse as fallbackParse } from 'recipe-ingredient-parser-v3';
import { IngredientForms, IngredientPreparations, StandardLookupTable, StandardMeasurements } from '../api/types/standardized';
import { logger } from './logger';
import { findLongestWholePhraseMatch } from './helpers';

function isLikelyUnit(word: string, unitsList: string[]): boolean {
  return unitsList.includes(word.toLowerCase());
}

function isLikelyAmount(word: string): boolean {
  return /^\d+$|^\d+\/\d+$|^\d+\.\d+$/.test(word); // whole, fraction, decimal
}

const OPTIONAL_PHRASES = [
    "optional"
];

const OPTIONAL_QUANTITY_PHRASES = [
    "or as needed",
    "to taste",
    "as needed",
    "or more",
    "as desired",
    "and more",
    "plus more to serve"
];

function stripOptionalQuantityPhrases(input: string): { cleaned: string; isOptional: boolean; optionalQuantity: boolean } {
    let cleaned = input;
    let isOptional = false;
    let optionalQuantity = false;

    for (const phrase of OPTIONAL_PHRASES) {
        const pattern = new RegExp(`\\b${phrase}\\b`, 'gi');
        if (pattern.test(cleaned)) {
            cleaned = cleaned.replace(pattern, '').trim();
            isOptional = true;
        }
    }
    for (const phrase of OPTIONAL_QUANTITY_PHRASES) {
        const pattern = new RegExp(`\\b${phrase}\\b`, 'gi');
        if (pattern.test(cleaned)) {
            cleaned = cleaned.replace(pattern, '').trim();
            optionalQuantity = true;
        }
    }

    // Remove trailing and leading commas and whitespace
    cleaned = cleaned.replace(/^,+|,+$/g, '').trim();

    return { cleaned, isOptional, optionalQuantity };
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
            .replace(/(\d)([\u00BC-\u00BE\u2150-\u215E])/g, (_, digit, frac) => `${digit} ${unicodeFractions[frac] || frac}`)
            .replace(/[\u00BC-\u00BE\u2150-\u215E]/g, (match) => unicodeFractions[match] || match)
            .replace(/–|—/g, "-");
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

function lookAheadForNextIngredient(
    tokens: string[],
    ingredientsSet: Set<string>,
    unitsList: string[],
): { index: number; skipCount: number; connector: string[] } | null {
    const DEBUG = false;

    if (DEBUG) logger.debug(`look ahead in tokens: ${tokens}`);
    const commonDualIngredients = new Set([
        "salt", "pepper", "black pepper", "ground black pepper", "white pepper", "oil", "vinegar",
        "sugar", "cinnamon", "nutmeg", "oregano", "thyme", "basil", "paprika",
        "coriander", "cumin", "onion", "garlic"
    ]);

    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i]?.toLowerCase();
        const next = tokens[i + 1]?.toLowerCase();
        const third = tokens[i + 2]?.toLowerCase();

        const isSeparator = token === "or" || token === "and" || token === ",";

        if (DEBUG) logger.debug(`--loop ${i}--`);
        if (DEBUG) logger.debug(`token: ${token}, next: ${next}, third: ${third}`);

        // === 1. "or use" or "and substitute" → substitution cue
        if ((token === "or" || token === "and") && (next === "use" || next === "substitute")) {
            return { index: i, skipCount: 2, connector: [token, next] };
        }

        // === 2. Separator followed by amount or unit → new ingredient
        const followsAmount = isLikelyAmount(next) || /^\d+[\/\d\.]*$/.test(next || "");
        const followsUnit = isLikelyUnit(next || "", unitsList);
        if (isSeparator && (followsAmount || followsUnit)) {
        if (DEBUG) logger.debug("→ separator followed by unit/amount → new ingredient");
            return { index: i, skipCount: 1, connector: [token] };
        }

        // === 3. Handle "salt and pepper", "salt and black pepper", etc.
        if ((token === "and" || token === "or") && i > 0 && i < tokens.length - 1) {
            // Build 1-word and 2-word phrases before and after the separator
            const before1 = tokens[i - 1]?.toLowerCase();
            const before2 = tokens[i - 2]?.toLowerCase();
            const after1 = tokens[i + 1]?.toLowerCase();
            const after2 = tokens[i + 2]?.toLowerCase();

            const beforePhrase = before2 ? `${before2} ${before1}` : before1;
            const afterPhrase = after2 ? `${after1} ${after2}` : after1;

            const beforeMatches =
                ingredientsSet.has(before1) || (before2 && ingredientsSet.has(beforePhrase));
            const afterMatches =
                ingredientsSet.has(after1) || (after2 && ingredientsSet.has(afterPhrase));

            if (beforeMatches && afterMatches) {
                if (DEBUG) logger.debug("→ dual ingredient combo like 'salt and black pepper'");
                    return { index: i, skipCount: 1, connector: [token] };
            }
        }
    }

    return null;
}

function extractFormAndPreparation(
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
            const segment = words.slice(i, i + prepWords.length).join(" ").replace(",", "");
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
            const segment = words.slice(i, i + formWords.length).join(" ").replace(",", "");
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
    quantity?: number;
    unit?: string;
    ingredient: string;
    forms?: string[];
    preparations?: string[];
    size?: "small" | "medium" | "large";
    isOptional?: boolean;
    optionalQuantity?: boolean;
    isSubstitute?: boolean,
    raw: string;
    parsedBy: 'manual' | 'fallback' | 'initialized';
}

export function parseIngredientLine(
    line: string,
    ingredientsSet: Set<string>,
    unitsList: string[],
    standardMeasurementsLookupTable: StandardLookupTable,
    allForms: IngredientForms,
    allPreparations: IngredientPreparations
): ParsedIngredient[] {
    const DEBUG = true;
    const parsedIngredients = [] as ParsedIngredient[];

    let { cleaned, isOptional, optionalQuantity } = stripOptionalQuantityPhrases(line.trim());
    let isSubstitute = false;
    let tokens = cleaned.split(/\s+/);

    while (tokens.length > 0) {
        // Parse Quantity and then remove it
        let { quantity, rest } = extractQuantityAndRest(tokens);

        // Parse Unit and then remove it
        const unit: string | undefined = extractAndStandardizeUnit(
            rest,
            unitsList,
            standardMeasurementsLookupTable
        );

        // Most of what can reliable be parsed out based on structure has been parsed and shaved off the input. Look ahead to indicate 
        // whether there is more than one ingredient left in the input
        const indexOfNextIngredient = lookAheadForNextIngredient(rest, ingredientsSet, unitsList);

        // Get the phrase between this ingredient and the next one in this input ex. "or", "or use"
        const connectingWords = indexOfNextIngredient !== null
            ? rest.slice(indexOfNextIngredient.index, indexOfNextIngredient.index + indexOfNextIngredient.skipCount)
            : null;

        const currentTokens = indexOfNextIngredient !== null
            ? rest.slice(0, indexOfNextIngredient.index)
            : [...rest];

        const raw = [...tokens.slice(0, tokens.length - rest.length), ...currentTokens].join(' ');

        // Adjust tokens for next iteration
        if (indexOfNextIngredient !== null) {
            tokens = rest.slice(indexOfNextIngredient.index + indexOfNextIngredient.skipCount);
            rest = currentTokens;
        } else {
            tokens = [];
        }
        if (DEBUG) logger.debug(`going to finish processing these tokens: ${rest}\ngoing to process these tokens next: ${tokens}`)

        // Attempt to parse a standard ingredient from the input
        const restPhrase = rest.join(' ').toLowerCase();
        const matchedIngredient = findLongestWholePhraseMatch(restPhrase, ingredientsSet);
        // Remove first occurrence of matched ingredient from rest
        if (matchedIngredient) {
            rest = restPhrase.replace(
                new RegExp(`\\b${matchedIngredient.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i'),
                ''
            ).trim().split(/\s+/);
        }
        
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
        // const ingredient = cleanedInput.replace(/,\s*$/, '').trim();

        const hasValidIngredient = matchedIngredient != null;
        const hasValidQuantity = quantity !== undefined;
        optionalQuantity = optionalQuantity || (!hasValidQuantity && hasValidIngredient);

        if (!hasValidIngredient) {
            const fallback = fallbackParse(raw, 'eng');
            parsedIngredients.push({
                quantity: fallback.quantity !== undefined ? parseFloat("" + fallback.quantity) : undefined,
                unit: fallback.unit || undefined,
                ingredient: fallback.ingredient || '',
                raw,
                parsedBy: 'fallback'
            });
        } else {
            parsedIngredients.push({
                quantity,
                unit,
                ingredient: matchedIngredient,
                forms,
                preparations,
                size,
                isOptional,
                optionalQuantity,
                isSubstitute,
                raw,
                parsedBy: 'manual'
            });
        }

        // Determine if next ingredient is a substitute or not
        if (connectingWords) {
            if (DEBUG) logger.debug("connecting words: ", connectingWords)
            isSubstitute = ["substitute", "or"].includes(connectingWords[0])
                || (connectingWords.length > 1 && ["substitute"].includes(connectingWords[1]))
            if (DEBUG && isSubstitute) logger.debug("This is a substitute!");
        }
    }

    return parsedIngredients;
}