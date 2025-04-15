export const removeEmptyFieldsFromObj = (obj: {[key: string]: any}) => {
    const newObj = { ...obj }; // Create a shallow copy to avoid mutating the original object
    for (const key in newObj) {
        if (!newObj[key]) {
            delete newObj[key];
        }
    }
    return newObj;
}