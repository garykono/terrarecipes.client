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

export function preprocessIngredientInput(input: string): string {
    let result = input.trim().toLowerCase();

    // Replace quantity words ("a dash" -> "1 dash")
    for (const [word, replacement] of Object.entries(quantityWords)) {
        const pattern = `\\b${word}\\s+(?=${Object.keys(unitReplacements).join("|")})\\b`;
        const re = new RegExp(pattern, "gi");
        result = result.replace(re, `${replacement} `);
    }

    // Regex to find number + unit pattern e.g. "2 dash", "1/2 pinch"
    // Captures: 
    //   group 1 = number (integer or fraction),
    //   group 2 = unit word
    const numberUnitRegex = new RegExp(
        `(\\d+(?:\\/\\d+)?|\\d*\\.\\d+)\\s*(${Object.keys(unitReplacements).join('|')})\\b`,
        "gi"
    );

    // Replace matches with multiplied normalized unit amount
    result = result.replace(numberUnitRegex, (match, quantityStr, unit) => {
        // Parse the quantity (integer, decimal, fraction)
        const quantity = parseFraction(quantityStr);
        
        // Parse the normalized replacement (e.g. "1/8 tsp")
        const [baseQtyStr, baseUnit] = unitReplacements[unit].split(' ');

        const baseQty = parseFraction(baseQtyStr);

        // Multiply quantities
        const multipliedQty = quantity * baseQty;

        // Convert back to fraction string for nicer display (optional)
        const multipliedQtyStr = multipliedQty % 1 === 0
        ? multipliedQty.toString()
        : decimalToFraction(multipliedQty);

        return `${multipliedQtyStr} ${baseUnit}`;
    });

    // Replace standalone units without numbers (e.g. "dash" -> "1/8 tsp")
    for (const [unit, replacement] of Object.entries(unitReplacements)) {
        const re = new RegExp(`(?<!\\d\\s)\\b${unit}\\b`, "gi");
        result = result.replace(re, replacement);
    }

    return result.trim();
}