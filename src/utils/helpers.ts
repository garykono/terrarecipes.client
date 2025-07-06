

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