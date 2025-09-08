const parseFilterStr = (filterStr) => {
    const filters = {};
    if (!filterStr) {
        return filters;
    }
    const filterPairs = filterStr.split('&'); // Split by '&'

    for (const pair of filterPairs) {
        const [key, value] = pair.split('='); // Split by '='
        filters[key] = value;
    }

    return filters;
};

export { parseFilterStr };
