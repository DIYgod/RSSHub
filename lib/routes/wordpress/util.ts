import got from '@/utils/got';
import { load } from 'cheerio';

const apiSlug = 'wp-json/wp/v2';

interface Filter {
    id: string;
    name: string;
    slug: string;
}

const filterKeys: Record<string, string> = {
    search: 's',
};

const filterApiKeys: Record<string, string | undefined> = {
    category: 'categories',
    tag: 'tags',
    search: undefined,
};

const filterApiKeysWithNoId = new Set(['search']);

/**
 * Bake filter search parameters.
 *
 * @param filterPairs - The filter pairs object.
 *                      e.g. `{ category: [ { id: ..., name: ..., slug: ... }, { id: ..., name: ..., slug: ... } ], tag: [ { id: ..., name: ..., slug: ... } ] }`.
 * @param pairKey - The filter pair key.
 *                  e.g. `{ id: ..., name: ..., slug: ... }`.
 * @param isApi - Indicates if the search parameters are for API.
 * @returns The baked filter search parameters.
 */
const bakeFilterSearchParams = (filterPairs: Record<string, Filter[] | string[]>, pairKey: string, isApi: boolean = false): URLSearchParams => {
    /**
     * Bake filters recursively.
     *
     * @param filterPairs - The filter pairs object.
     *                      e.g. `{ category: [ { id: ..., name: ..., slug: ... }, { id: ..., name: ..., slug: ... } ], tag: [ { id: ..., name: ..., slug: ... } ] }`.
     * @param filterSearchParams - The filter search parameters.
     *                             e.g. `category=a,b&tag=c`.
     * @returns The baked filter search parameters.
     *          e.g. `category=a,b&tag=c`.
     */
    const bakeFilters = (filterPairs: Record<string, Filter[] | string[]>, filterSearchParams: URLSearchParams): URLSearchParams => {
        const keys = Object.keys(filterPairs).filter((key) => filterPairs[key]?.length > 0 && (isApi ? Object.hasOwn(filterApiKeys, key) : Object.hasOwn(filterKeys, key)));

        if (keys.length === 0) {
            return filterSearchParams;
        }

        const key = keys[0];
        const pairs = filterPairs[key];

        const originalFilters = { ...filterPairs };
        delete originalFilters[key];

        const filterKey = getFilterKeyForSearchParams(key, isApi);
        const pairValues = pairs.map((pair) => (Object.hasOwn(pair, pairKey) ? pair[pairKey] : pair));

        if (filterKey) {
            filterSearchParams.append(filterKey, pairValues.join(','));
        }

        return bakeFilters(originalFilters, filterSearchParams);
    };

    return bakeFilters(filterPairs, new URLSearchParams());
};

/**
 * Bake filters with pair.
 *
 * @param filters - The filters object.
 *                  e.g. `{ category: [ a, b ], tag: [ c ] }`.
 * @returns The baked filters.
 *          e.g. `{ category: [ { id: ..., name: ..., slug: ... }, { id: ..., name: ..., slug: ... } ], tag: [ { id: ..., name: ..., slug: ... } ] }`.
 */
const bakeFiltersWithPair = async (filters: Record<string, string[]>, rootUrl: string) => {
    /**
     * Bake keywords recursively.
     *
     * @param key - The key.
     *              e.g. `category` or `tag`.
     * @param keywords - The keywords.
     *                   e.g. `[ a, b ]`.
     * @returns The baked keywords.
     *          e.g. `[ { id: ..., name: ..., slug: ... }, { id: ..., name: ..., slug: ... } ]`.
     */
    const bakeKeywords = async (key: string, keywords: string[]) => {
        if (keywords.length === 0) {
            return [];
        }

        const [keyword, ...rest] = keywords;

        const filter = await getFilterByKeyAndKeyword(key, keyword, rootUrl);

        return [
            ...(filter?.id && filter?.slug
                ? [
                      {
                          id: filter.id,
                          name: filter.name,
                          slug: filter.slug,
                      },
                  ]
                : []),
            ...(await bakeKeywords(key, rest)),
        ];
    };

    /**
     * Bake filters recursively.
     *
     * @param filters - The filters object.
     *                  e.g. `{ category: [ a, b ], tag: [ c ] }`.
     * @param filtersWithPair - The filters with pairs.
     *                          e.g. `{ category: [ { id: ..., name: ..., slug: ... }, { id: ..., name: ..., slug: ... } ], tag: [ { id: ..., name: ..., slug: ... } ] }`.
     * @returns The baked filters.
     *          e.g. `{ category: [ { id: ..., name: ..., slug: ... }, { id: ..., name: ..., slug: ... } ], tag: [ { id: ..., name: ..., slug: ... } ] }`.
     */
    const bakeFilters = async (filters: Record<string, string[]>, filtersWithPair: Record<string, Filter[]>) => {
        const keys = Object.keys(filters);

        if (keys.length === 0) {
            return filtersWithPair;
        }

        const key = keys[0];
        const keywords = filters[key];

        const originalFilters = { ...filters };
        delete originalFilters[key];

        return bakeFilters(originalFilters, {
            ...filtersWithPair,
            [key]: filterApiKeysWithNoId.has(key) ? keywords : await bakeKeywords(key, keywords),
        });
    };

    return await bakeFilters(filters, {});
};

/**
 * Bake URL with search parameters.
 *
 * @param url - The URL.
 * @param rootUrl - The root URL.
 * @param searchParams - The search parameters.
 * @returns The baked URL.
 */
const bakeUrl = (url: string, rootUrl: string, searchParams: URLSearchParams = new URLSearchParams()): string => {
    const searchParamsStr = searchParams.toString();
    const searchParamsSuffix = searchParamsStr ? `?${searchParamsStr}` : '';

    return `${rootUrl}/${url}${searchParamsSuffix}`;
};

/**
 * Fetch data from the specified URL.
 *
 * @param url - The URL to fetch data from.
 * @param rootUrl - The root URL.
 * @returns A promise that resolves to an object containing the fetched data to be added into `ctx.state.data`.
 */
const fetchData = async (url: string, rootUrl: string): Promise<object> => {
    /**
     * Request URLs recursively.
     *
     * @param urls - The URLs to request.
     * @returns A promise that resolves to the response data or undefined if no response is available.
     */
    const requestUrls = async (urls: string[]): Promise<string | undefined> => {
        if (urls.length === 0) {
            return;
        }

        const [currentUrl, ...remainingUrls] = urls;
        try {
            const { data: response } = await got.get(currentUrl);
            return response;
        } catch {
            return requestUrls(remainingUrls);
        }
    };

    const response = await requestUrls([url, rootUrl]);

    if (!response) {
        return {};
    }

    const $ = load(response);

    const title = $('title').first().text();
    const image = new URL('wp-content/uploads/site_logo.png', rootUrl).href;

    return {
        title,
        description: $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content'),
        link: url,
        allowEmpty: true,
        image,
        author: $('meta[property="og:site_name"]').attr('content'),
        language: $('html').attr('lang'),
    };
};

/**
 * Get filter by key and keyword.
 *
 * @param key - The key.
 *              e.g. `category` or `tag`.
 * @param keyword - The keywords.
 *                  e.g. `keyword1`.
 * @returns A promise that resolves to the filter object if found, or undefined if not found.
 */
const getFilterByKeyAndKeyword = async (key: string, keyword: string, rootUrl: string): Promise<Filter | undefined> => {
    const apiFilterUrl = `${rootUrl}/${apiSlug}/${getFilterKeyForSearchParams(key, true)}`;

    const { data: response } = await got(apiFilterUrl, {
        searchParams: {
            search: keyword,
        },
    });

    return response.length > 0 ? response[0] : undefined;
};

/**
 * Get filter key for search parameters.
 *
 * @param key - The key. e.g. `category` or `tag`.
 * @param isApi - Indicates whether the key is for the API.
 * @returns The filter key for search parameters, or undefined if not found.
 *          e.g. `categories` or `tags`.
 */
const getFilterKeyForSearchParams = (key: string, isApi: boolean = false): string | undefined => {
    const keys = isApi ? filterApiKeys : filterKeys;

    return Object.hasOwn(keys, key) ? (keys[key] ?? key) : undefined;
};

/**
 * Get filter parameters for URL.
 *
 * @param filterPairs - The filter pairs object.
 *                      e.g. `{ category: [ { id: ..., name: ..., slug: ... }, { id: ..., name: ..., slug: ... } ], tag: [ { id: ..., name: ..., slug: ... } ] }`.
 * @returns The filter parameters for the URL, or undefined if no filters are available.
 */
const getFilterParamsForUrl = (filterPairs: Record<string, Filter[]>): string | undefined => {
    const keys = Object.keys(filterPairs).filter((key) => filterPairs[key].length > 0 && !Object.hasOwn(filterKeys, key));

    if (keys.length === 0) {
        return;
    }

    const key = keys[0];

    return `${key}/${filterPairs[key].map((pair) => pair.slug).join('/')}`;
};

/**
 * Parses a filter string into a filters object.
 *
 * @param filterStr - The filter string to parse.
 *                    e.g. `category/a,b/tag/c`.
 * @returns The parsed filters object.
 *          e.g. `{ category: [ 'a', 'b' ], tag: [ 'c' ] }`.
 */
const parseFilterStr = (filterStr: string | undefined): Record<string, string[]> => {
    /**
     * Recursively parses a filter string.
     *
     * @param remainingStr - The remaining filter string to parse.
     *                       e.g. `category/a,b/tag/c`.
     * @param filters - The accumulated filters object.
     *                  e.g. `{ category: [ a, b ], tag: [ c ] }`.
     * @param currentKey - The current filter key.
     *                     e.g. `category` or `tag`.
     * @returns The parsed filters object.
     */
    const parseStr = (remainingStr: string | undefined, filters: Record<string, string[]> = {}, currentKey?: string): Record<string, string[]> => {
        if (!remainingStr) {
            return filters;
        }

        const [word, ...rest] = remainingStr.split(/\/|,/);

        const isKey = Object.hasOwn(filterApiKeys, word);
        const key = isKey ? word : currentKey;

        const newFilters = key
            ? {
                  ...filters,
                  [key]: [...(filters[key] || []), ...(isKey ? [] : [word])],
              }
            : filters;

        return parseStr(rest.join('/'), newFilters, key);
    };

    return parseStr(filterStr, {});
};

export { apiSlug, bakeFilterSearchParams, bakeFiltersWithPair, bakeUrl, fetchData, getFilterParamsForUrl, parseFilterStr };
