// Helper: parse fraction string like "1/8" or "3/4" or "2" into a decimal number
function parseFraction(str: string): number {
    if (str.includes('/')) {
        const [num, den] = str.split('/').map(Number);
        return num / den;
    }
    return Number(str);
}

// Helper: convert decimal number back to a fraction string (approximate)
function decimalToFraction(decimal: number): string {
    const tolerance = 1.0E-6;
    let numerator = 1;
    let denominator = 1;
    let fraction = numerator / denominator;

    while (Math.abs(fraction - decimal) > tolerance) {
        if (fraction < decimal) {
            numerator++;
        } else {
            denominator++;
            numerator = Math.round(decimal * denominator);
        }
            fraction = numerator / denominator;
        if (denominator > 32) break; // limit denominator to 32 for simplicity
    }
    return `${numerator}/${denominator}`;
}

// Map of non-standard units to their normalized equivalents
const unitReplacements: { [key: string]: string } = {
    dash: "1/8 tsp",
    dashes: "1/8 tsp",
    pinch: "1/8 tsp",
    pinches: "1/8 tsp",
    splash: "1 tsp",
    splashes: "1 tsp",
    handful: "1/4 cup",
    handfuls: "1/4 cup"
};

// Optional: handles "a dash", "one pinch", etc.
const quantityWords: { [key: string]: string } = {
    a: "1",
    an: "1",
    one: "1",
};

const quantityModifiers = [
    "heaped",
    "scant",
    "level",
    "rounded",
    "generous",
    "sparse",
    "overflowing",
    "flat",
    "packed",
    "lightly packed",
    "firmly packed"
];

function removeQuantityModifiersFromTokens(tokens: string[]): string[] {
    const lowerModifiers = new Set(quantityModifiers.map(m => m.toLowerCase()));
    return tokens.filter(token => !lowerModifiers.has(token.toLowerCase()));
}

const containerWords = ['can', 'jar', 'bottle', 'pack', 'package'];

function removeContainerWords(tokens: string[]): string[] {
    return tokens.filter((token, i) => !(containerWords.includes(token.toLowerCase()) && i > 0));
}

/**
 * Strips leading numbers
 * @param input 
 * @returns 
 */
function normalizeContainerQuantityPhrase(input: string): string {
  const regex = /\b(\d+)\s*\(\s*(\d+)\s*[-\s]?([a-zA-Z]+)\s*\)\s*(can|jar|bottle|pack|package)s?\b/gi;

  return input.replace(regex, (_, qtyStr, sizeStr, unit, container) => {
    const qty = parseInt(qtyStr, 10);
    const size = parseInt(sizeStr, 10);

    if (isNaN(qty) || isNaN(size)) return _;

    const total = qty * size;
    return `${total} ${unit}`;
  });
}

// NEW: Normalize parentheses and hyphenated numeric-unit pairs
function normalizeTokens(tokens: string[], knownUnits: string[]): string[] {
    const unitSet = new Set(knownUnits.map(u => u.toLowerCase()));
    const result: string[] = [];

    for (let token of tokens) {
        // Step 1: Strip outer parentheses
        if (token.startsWith('(') && token.endsWith(')')) {
            token = token.slice(1, -1);
        }

        // Step 2: Split number-unit hyphenated pair (e.g., 15-ounce)
        if (token.includes('-')) {
            const parts = token.split('-');
            if (
                parts.length === 2 &&
                !isNaN(Number(parts[0])) &&
                unitSet.has(parts[1].toLowerCase())
            ) {
                result.push(parts[0], parts[1]);
                continue;
            }
        }

        result.push(token);
    }

    return result;
}

export function preprocessIngredientInput(input: string, rawUnitsList: string[]): string {
    let working = input.trim().toLowerCase();

    // === Step 1: Replace "a dash" → "1 dash" using quantityWords
    for (const [word, replacement] of Object.entries(quantityWords)) {
        const pattern = `\\b${word}\\s+(?=${Object.keys(unitReplacements).join("|")})\\b`;
        const re = new RegExp(pattern, "gi");
        working = working.replace(re, `${replacement} `);
    }

    // === Step 2: Normalize "1 dash" → "1/8 tsp"
    const numberUnitRegex = new RegExp(
        `(\\d+(?:\\/\\d+)?|\\d*\\.\\d+)\\s*(${Object.keys(unitReplacements).join('|')})\\b`,
        "gi"
    );

    working = working.replace(numberUnitRegex, (match, quantityStr, unit) => {
        const quantity = parseFraction(quantityStr);
        const [baseQtyStr, baseUnit] = unitReplacements[unit].split(' ');
        const baseQty = parseFraction(baseQtyStr);
        const multipliedQty = quantity * baseQty;

        const multipliedQtyStr =
        multipliedQty % 1 === 0
            ? multipliedQty.toString()
            : decimalToFraction(multipliedQty);

        return `${multipliedQtyStr} ${baseUnit}`;
    });

    // === Step 3: Replace standalone units like "pinch" → "1/8 tsp"
    for (const [unit, replacement] of Object.entries(unitReplacements)) {
        const re = new RegExp(`(?<!\\d\\s)\\b${unit}\\b`, "gi");
        working = working.replace(re, replacement);
    }

    // === Step 4: Handle pattern like "1 (15-ounce) can" → "15 ounce"
    working = normalizeContainerQuantityPhrase(working);

    // === Step 5: Tokenize and apply token-level normalization
    let tokens = working.split(/\s+/);
    tokens = normalizeTokens(tokens, rawUnitsList);
    tokens = removeQuantityModifiersFromTokens(tokens);
    tokens = removeContainerWords(tokens);

    // === Step 6: Return final cleaned string
    const preprocessedIngredient = tokens.join(' ').trim();
    //logger.debug(`ingredient line: ${input} ==> ${preprocessedIngredient}`);
    return preprocessedIngredient;
}
