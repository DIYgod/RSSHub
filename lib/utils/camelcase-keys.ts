const isObject = (obj: any) => obj && typeof obj === 'object';
const isPlainObject = (obj: any) => isObject(obj) && Object.prototype.toString.call(obj) === '[object Object]' && Object.getPrototypeOf(obj) === Object.prototype;

/**
 * A simple camelCase function that only handles strings, but not handling symbol, date, or other complex case.
 * If you need to handle more complex cases, please use camelcase-keys package.
 */
export const camelcaseKeys = <T = any>(obj: any): T => {
    if (Array.isArray(obj)) {
        return obj.map((x) => camelcaseKeys(x)) as any;
    }

    if (isPlainObject(obj)) {
        const result: any = {};
        for (const key of Object.keys(obj)) {
            const nextKey = isMongoId(key) ? key : camelcase(key);
            result[nextKey] = camelcaseKeys(obj[key]);
        }
        return result as any;
    }

    return obj;
};

export function camelcase(str: string) {
    return str.replace(/^_+/, '').replaceAll(/([_-][a-z])/gi, ($1) => $1.toUpperCase().replace('-', '').replace('_', ''));
}
const isMongoId = (id: string) => id.length === 24 && /^[\dA-Fa-f]{24}$/.test(id);
