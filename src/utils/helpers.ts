

export const removeEmptyFieldsFromObj = (obj: {[key: string]: any}) => {
    const newObj = { ...obj }; // Create a shallow copy to avoid mutating the original object
    for (const key in newObj) {
        if (!newObj[key]) {
            delete newObj[key];
        }
    }
    return newObj;
}

export const getCurrentWordAtPosition = (text: string, position: number | null) => {
    if (!position) {
        return "";
    }

    if (position < 0 || position > text.length) return "";

    const left = text.slice(0, position);
    const right = text.slice(position);

    // Match the word fragment to the left of the cursor
    const leftMatch = left.match(/[\w-]+$/);
    const rightMatch = right.match(/^[\w-]+/);

    const leftWord = leftMatch ? leftMatch[0] : "";
    const rightWord = rightMatch ? rightMatch[0] : "";

    return leftWord + rightWord;
}

export interface StandardDataFromApi {
    [key: string]: any;
}

export const flattenDataForFuse = (data: StandardDataFromApi, type: "ingredient" | "measurement") => {
    const formattedData: any[] = [];
    Object.keys(data).map(key => {
        formattedData.push({
            ...data[key],
            type
        })
    })
    return formattedData;
}

export function formatWithUnicodeFraction(value: number): string {
    const unicodeFractions: { [decimal: number]: string } = {
        0.125: '⅛',
        0.25: '¼',
        0.333: '⅓',
        0.375: '⅜',
        0.5: '½',
        0.625: '⅝',
        0.666: '⅔',
        0.75: '¾',
        0.875: '⅞',
        0.2: '⅕',
        0.4: '⅖',
        0.6: '⅗',
        0.8: '⅘',
    };

    const integerPart = Math.floor(value);
    const decimalPart = value - integerPart;

    let closestFraction = '';
    let smallestDiff = Infinity;
    let roundedDecimal = 0;

    for (const [decimalStr, fractionChar] of Object.entries(unicodeFractions)) {
        const decimal = parseFloat(decimalStr);
        const diff = Math.abs(decimal - decimalPart);
        if (diff < smallestDiff) {
            smallestDiff = diff;
            closestFraction = fractionChar;
            roundedDecimal = decimal;
        }
    }

    // Only use a fraction if within tolerance
    const tolerance = 0.06; // you can adjust this to be stricter or more lenient
    if (smallestDiff <= tolerance) {
        if (integerPart === 0 && roundedDecimal > 0) {
            return closestFraction; // e.g. "½"
        } else {
            return `${integerPart} ${closestFraction}`.trim();
        }
    }

    // Otherwise, round to 2 decimals or drop decimals entirely if very close to int
    return Number(value.toFixed(2)) % 1 === 0
        ? `${Math.round(value)}`
        : value.toFixed(2);
}

export function findLongestWholePhraseMatch(input: string, phrases: Set<string>): string | null {
    let match: string | null = null;

    phrases.forEach(phrase => {
        const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // escape regex special chars
        const regex = new RegExp(`\\b${escaped}\\b`, 'i'); // match whole words, case-insensitive

        if (regex.test(input)) {
            if (!match || phrase.length > match.length) {
                match = phrase;
            }
        }
    })

    return match;
}