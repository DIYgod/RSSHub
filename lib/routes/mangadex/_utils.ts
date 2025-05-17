/**
 * Get the first value that matches the keys in the source object
 *
 * @param source the source object
 * @param keys the keys to search
 * @returns the first match value, or the first value as fallback
 */
export const firstMatch = (source: Map<string, string> | object, keys: string[]) => {
    for (const key of keys) {
        const value = source instanceof Map ? source.get(key) : source[key];
        if (value) {
            return value;
        }
    }
    return Object.values(source)[0];
};

/**
 * Convert parameters to query string
 *
 * @param params parameters to be converted to query string
 * @returns the query string
 * @usage toQueryString({ a: 1, b: '2', c: [3, 4], d: {5: 'five', 6: 'six'} })
 *   >> '?a=1&b=2&c[]=3&c[]=4&d[5]=five&d[6]=six'
 */
export function toQueryString(params: Record<string, any>): string {
    const queryParts: string[] = [];

    for (const [key, value] of Object.entries(params)) {
        if (typeof value === 'object' && !Array.isArray(value) && !(value instanceof Set)) {
            for (const [subKey, subValue] of Object.entries(value)) {
                if (typeof subValue === 'string' || typeof subValue === 'number' || typeof subValue === 'boolean') {
                    queryParts.push(`${encodeURIComponent(key)}[${encodeURIComponent(subKey)}]=${encodeURIComponent(subValue)}`);
                }
            }
        } else if (Array.isArray(value) || value instanceof Set) {
            for (const item of value) {
                queryParts.push(`${encodeURIComponent(key)}[]=${encodeURIComponent(item)}`);
            }
        } else {
            queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
        }
    }

    if (queryParts.length === 0) {
        return '';
    }
    return '?' + queryParts.join('&');
}
