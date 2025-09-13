// helper: get facet prefix (string before the first "-")
export const getPrefix = (id: string): string => {
    const i = id.indexOf("-");
    return i === -1 ? id : id.slice(0, i);
}

export const shavePrefix = (id: string): string => {
    const i = id.indexOf("-");
    return i === -1 ? id : id.slice(i + 1);
};
