import { load } from 'cheerio';

import got from '@/utils/got';

const rootUrl = 'https://getitfree.cn';
const apiSlug = 'wp-json/wp/v2';

const filterKeys = {
    search: 's',
};

const filterApiKeys = {
    category: 'categories',
    tag: 'tags',
    search: undefined,
};

const filterApiKeysWithNoId = new Set(['search']);

/**
 * Bake filter search parameters.
 *
 * @param {Object} filterPairs - The filter pairs object.
 *                               e.g. `{ category: [ { id: ..., name: ..., slug: ... }, { id: ..., name: ..., slug: ... } ], tag: [ { id: ..., name: ..., slug: ... } ] }`.
 * @param {string} pairKey - The filter pair key.
 *                           e.g. `{ id: ..., name: ..., slug: ... }`.
 * @param {boolean} [isApi=false] - IIndicates if the search parameters are for API.
 * @returns {URLSearchParams} The baked filter search parameters.
 */
const bakeFilterSearchParams = (filterPairs, pairKey, isApi = false) => {
    /**
     * Bake filters recursively.
     *
     * @param {Object} filterPairs - The filter pairs object.
     *                               e.g. `{ category: [ { id: ..., name: ..., slug: ... }, { id: ..., name: ..., slug: ... } ], tag: [ { id: ..., name: ..., slug: ... } ] }`.
     * @param {URLSearchParams} filterSearchParams - The filter search parameters.
     *                                               e.g. `category=a,b&tag=c`.
     * @returns {URLSearchParams} The baked filter search parameters.
     *                            e.g. `category=a,b&tag=c`.
     */
    const bakeFilters = (filterPairs, filterSearchParams) => {
        const keys = Object.keys(filterPairs).filter((key) => filterPairs[key]?.length > 0 && (isApi ? Object.hasOwn(filterApiKeys, key) : Object.hasOwn(filterKeys, key)));

        if (keys.length === 0) {
            return filterSearchParams;
        }

        const key = keys[0];
        const pairs = filterPairs[key];

        const originalFilters = Object.assign({}, filterPairs);
        delete originalFilters[key];

        filterSearchParams.append(getFilterKeyForSearchParams(key, isApi), pairs.map((pair) => (Object.hasOwn(pair, pairKey) ? pair[pairKey] : pair)).join(','));

        return bakeFilters(originalFilters, filterSearchParams);
    };

    return bakeFilters(filterPairs, new URLSearchParams());
};

/**
 * Bake filters with pair.
 *
 * @param {Object} filters - The filters object.
 *                           e.g. `{ category: [ a, b ], tag: [ c ] }`.
 * @returns {Promise<Object>} The baked filters.
 *                            e.g. `{ category: [ { id: ..., name: ..., slug: ... }, { id: ..., name: ..., slug: ... } ], tag: [ { id: ..., name: ..., slug: ... } ] }`.
 */
const bakeFiltersWithPair = async (filters) => {
    /**
     * Bake keywords recursively.
     *
     * @param {string} key - The key.
     *                       e.g. `category` or `tag`.
     * @param {Array<string>} keywords - The keywords.
     *                                   e.g. `[ a, b ]`.
     * @returns {Promise<Array<Object>>} The baked keywords.
     *                                   e.g. `[ { id: ..., name: ..., slug: ... }, { id: ..., name: ..., slug: ... } ]`.
     */
    const bakeKeywords = async (key, keywords) => {
        if (keywords.length === 0) {
            return [];
        }

        const [keyword, ...rest] = keywords;

        const filter = await getFilterByKeyAndKeyword(key, keyword);

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
     * @param {Object} filters - The filters object.
     *                           e.g. `{ category: [ a, b ], tag: [ c ] }`.
     * @param {Object} filtersWithPair - The filters with pairs.
     *                                   e.g. `{ category: [ { id: ..., name: ..., slug: ... }, { id: ..., name: ..., slug: ... } ], tag: [ { id: ..., name: ..., slug: ... } ] }`.
     * @returns {Promise<Object>} The baked filters.
     *                            e.g. `{ category: [ { id: ..., name: ..., slug: ... }, { id: ..., name: ..., slug: ... } ], tag: [ { id: ..., name: ..., slug: ... } ] }`.
     */
    const bakeFilters = async (filters, filtersWithPair) => {
        const keys = Object.keys(filters);

        if (keys.length === 0) {
            return filtersWithPair;
        }

        const key = keys[0];
        const keywords = filters[key];

        const originalFilters = Object.assign({}, filters);
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
 * @param {string} url - The URL.
 * @param {string} rootUrl - The root URL.
 * @param {URLSearchParams} [searchParams=new URLSearchParams()] - The search parameters.
 * @returns {string} The baked URL.
 */
const bakeUrl = (url, rootUrl, searchParams = new URLSearchParams()) => {
    const searchParamsStr = String(searchParams) ? `?${searchParams}` : '';

    return new URL(`${url}${searchParamsStr}`, rootUrl).href;
};

/**
 * Fetch data from the specified URL.
 *
 * @param {string} url - The URL to fetch data from.
 * @returns {Promise<Object>} A promise that resolves to an object containing the fetched data
 *                            to be added into `ctx.state.data`.
 */
const fetchData = async (url) => {
    /**
     * Request URLs recursively.
     *
     * @param {Array<string>} urls - The URLs to request.
     * @returns {Promise<undefined|Object>} A promise that resolves to the response data
     *                                      or undefined if no response is available.
     */
    const requestUrls = async (urls) => {
        if (urls.length === 0) {
            return;
        }

        const [currentUrl, ...remainingUrls] = urls;
        try {
            const { data: response } = await got(currentUrl);
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

    const title = $('title').text().split(/\|/)[0];
    const image = new URL('wp-content/uploads/site_logo.png', rootUrl).href;
    const icon = new URL($('link[rel="shortcut icon"]').prop('href'), rootUrl).href;

    return {
        title,
        link: url,
        description: $('meta[name="description"]').prop('content'),
        language: $('html').prop('lang'),
        image,
        icon,
        logo: icon,
        subtitle: title.split(/【/)[0],
        author: $('h1.logo a').prop('title'),
        allowEmpty: true,
    };
};

/**
 * Get filter by key and keyword.
 *
 * @param {string} key - The key.
 *                       e.g. `category` or `tag`.
 * @param {string} keyword - The keywords.
 *                           e.g. `keyword1`.
 * @returns {Promise<Object|undefined>} A promise that resolves to the filter object if found,
 *                                      or undefined if not found.
 */
const getFilterByKeyAndKeyword = async (key, keyword) => {
    const apiFilterUrl = new URL(`${apiSlug}/${getFilterKeyForSearchParams(key, true)}`, rootUrl).href;

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
 * @param {string} key - The key. e.g. `category` or `tag`.
 * @param {boolean} [isApi=false] - Indicates whether the key is for the API.
 * @returns {string|undefined} The filter key for search parameters, or undefined if not found.
 *                             e.g. `categories` or `tags`.
 */
const getFilterKeyForSearchParams = (key, isApi = false) => {
    const keys = isApi ? filterApiKeys : filterKeys;

    return Object.hasOwn(keys, key) ? (keys[key] ?? key) : undefined;
};

/**
 * Get filter names for titles.
 *
 * @param {Object} filterPairs - The filter pairs object.
 *                               e.g. `{ category: [ { id: ..., name: ..., slug: ... }, { id: ..., name: ..., slug: ... } ], tag: [ { id: ..., name: ..., slug: ... } ] }`.
 * @returns {string} A string containing the joined filter names for titles.
 *                   e.g. `name1,name2`.
 */
const getFilterNameForTitle = (filterPairs) =>
    Object.values(filterPairs)
        .flat()
        .map((pair) => pair?.name ?? pair?.slug ?? pair)
        .filter(Boolean)
        .join(',');

/**
 * Get filter parameters for URL.
 *
 * @param {Object} filterPairs - The filter pairs object.
 *                               e.g. `{ category: [ { id: ..., name: ..., slug: ... }, { id: ..., name: ..., slug: ... } ], tag: [ { id: ..., name: ..., slug: ... } ] }`.
 * @returns {string|undefined} The filter parameters for the URL, or undefined if no filters are available.
 */
const getFilterParamsForUrl = (filterPairs) => {
    const keys = Object.keys(filterPairs).filter((key) => filterPairs[key]);

    if (keys.length === 0) {
        return;
    }

    const key = keys[0];

    return `${key}/${filterPairs[key].map((pair) => pair.slug).join('/')}`;
};

/**
 * Parse filter string into filters object.
 *
 * @param {string} filterStr - The filter string to parse.
 *                             e.g. `category/a,b/tag/c`.
 * @returns {Object} The parsed filters object.
 *                   e.g. `{ category: [ a, b ], tag: [ c ] }`.
 */
const parseFilterStr = (filterStr) => {
    /**
     * Parse filter string recursively.
     *
     * @param {string} filterStr - The remaining filter string to parse.
     *                             e.g. `category/a,b/tag/c`.
     * @param {Object} filters - The accumulated filters object.
     *                           e.g. `{ category: [ a, b ], tag: [ c ] }`.
     * @param {string} filterKey - The current filter key.
     *                             e.g. `category` or `tag`.
     * @returns {Object} The parsed filters object.
     */
    const parseStr = (filterStr, filters = {}, filterKey) => {
        if (!filterStr) {
            return filters;
        }

        const [word, ...rest] = filterStr.split(/\/|,/);

        const isKey = Object.hasOwn(filterApiKeys, word);
        const key = isKey ? word : filterKey;

        const newFilters = {
            ...filters,
            [key]: [...(filters[key] || []), ...(isKey ? [] : [word])],
        };

        return parseStr(rest.join('/'), newFilters, key);
    };

    return parseStr(filterStr, {});
};

export { apiSlug, bakeFilterSearchParams, bakeFiltersWithPair, bakeUrl, fetchData, getFilterNameForTitle, getFilterParamsForUrl, parseFilterStr, rootUrl };
