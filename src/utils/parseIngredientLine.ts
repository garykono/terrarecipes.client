import { parse as fallbackParse } from 'recipe-ingredient-parser-v3';

function isLikelyUnit(word: string, unitsList: string[]): boolean {
  return unitsList.includes(word.toLowerCase());
}

function isLikelyAmount(word: string): boolean {
  return /^\d+$|^\d+\/\d+$|^\d+\.\d+$/.test(word); // whole, fraction, decimal
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

    // === Handle ranges: "1/8 to 1/4", "2-3", "3 to 4"
    const rangeMatch = joined.match(/(\d+(?:\s+\d+\/\d+|\.\d+|\/\d+)?)[\s-]*(?:to\s+)?(\d+(?:\s+\d+\/\d+|\.\d+|\/\d+)?)/i);
    if (rangeMatch) {
        const minRaw = rangeMatch[1];
        const maxRaw = rangeMatch[2];
        const min = parseFraction(minRaw);
        const max = parseFraction(maxRaw);
        const average = (min + max) / 2;
        const rangeStr = rangeMatch[0];

        const rest = joined.replace(rangeStr, '').trim().split(/\s+/);
        return { quantity: average, rest };
    }

    // === Handle normal/mixed numbers: "1", "1 1/2"
    const quantityTokens: string[] = [];
    while (tokens.length && isLikelyAmount(tokens[0])) {
        quantityTokens.push(tokens.shift()!);
    }

    const quantity = quantityTokens.length > 0 ? parseFraction(quantityTokens.join(' ')) : undefined;

    return { quantity, rest: tokens };
}

function splitIngredientNameAndPreparation(input: string): {
    ingredient: string;
    preparation?: string;
    } {
    const trimmed = input.trim();

    // 1. Split at comma
    const [base, ...prepParts] = trimmed.split(',');

    // 2. Handle case like "jalapeño, seeded and diced"
    const preparation = prepParts.length > 0
        ? prepParts.join(',').trim().replace(/\s+/g, ' ') || undefined
        : undefined;

    // 3. Optional: remove anything in parentheses (like "(chopped)")
    const ingredient = base.replace(/\s*\(.*?\)\s*/g, '').trim();

    return {
        ingredient,
        preparation
    };
}

export interface ParsedIngredient {
    quantity?: number;
    unit?: string;
    ingredient: string;
    preparation?: string;
    raw: string;
    parsedBy: 'manual' | 'fallback' | 'initialized';
}

export function parseIngredientLine(line: string, unitsList: string[]): ParsedIngredient {
    const raw = line.trim();
    const tokens = raw.split(/\s+/);

    const { quantity, rest } = extractQuantityAndRest(tokens);

    let unit: string | undefined;
    if (rest.length && isLikelyUnit(rest[0], unitsList)) {
        unit = rest.shift();
    }

    const { ingredient, preparation } = splitIngredientNameAndPreparation(rest.join(' ').trim());

    const hasEnough = quantity !== undefined && ingredient.length > 0;

    if (!hasEnough) {
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
        quantity,
        unit,
        ingredient,
        preparation,
        raw,
        parsedBy: 'manual'
    };
}