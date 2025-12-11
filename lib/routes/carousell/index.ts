import type { Data, DataItem, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import type { ListingCard } from './types';

export const route: Route = {
    path: '/:region/:keyword',
    categories: ['shopping'],
    example: '/carousell/sg/iphone',
    parameters: {
        region: {
            description: 'Region code',
            options: [
                { value: 'au', label: 'Australia' },
                { value: 'ca', label: 'Canada' },
                { value: 'hk', label: 'Hong Kong' },
                { value: 'id', label: 'Indonesia' },
                { value: 'my', label: 'Malaysia' },
                { value: 'nz', label: 'New Zealand' },
                { value: 'ph', label: 'Philippines' },
                { value: 'sg', label: 'Singapore' },
                { value: 'tw', label: 'Taiwan' },
            ],
        },
        keyword: {
            description: 'Search keyword',
        },
    },
    name: 'Keyword Search',
    maintainers: ['TonyRL'],
    handler,
    radar: [
        { source: ['au.carousell.com/search/:keyword'], target: '/au/:keyword' },
        { source: ['ca.carousell.com/search/:keyword'], target: '/ca/:keyword' },
        { source: ['www.carousell.com.hk/search/:keyword'], target: '/hk/:keyword' },
        { source: ['id.carousell.com/search/:keyword'], target: '/id/:keyword' },
        { source: ['www.carousell.com.my/search/:keyword'], target: '/my/:keyword' },
        { source: ['nz.carousell.com/search/:keyword'], target: '/nz/:keyword' },
        { source: ['www.carousell.ph/search/:keyword'], target: '/ph/:keyword' },
        { source: ['www.carousell.sg/search/:keyword'], target: '/sg/:keyword' },
        { source: ['tw.carousell.com/search/:keyword'], target: '/tw/:keyword' },
    ],
};

const regionMap = {
    au: {
        api: 'https://au.carousell.com/ds/filter/cf/4.0/search/',
        baseUrl: 'https://au.carousell.com',
        payload: {
            bestMatchEnabled: false,
            canChangeKeyword: false,
            ccid: '1071',
            count: 48,
            countryCode: 'AU',
            countryId: '2077456',
            filters: [],
            includeBpEducationBanner: true,
            includeListingDescription: false,
            includePopularLocations: false,
            includeSuggestions: 'true',
            isCertifiedSpotlightEnabled: false,
            locale: 'en',
            prefill: { prefill_sort_by: '3' }, // most recent
            // query: '',
            sortParam: { fieldName: '3' },
        },

        referer: (query) => `https://au.carousell.com/search/${query}?addRecent=true&canChangeKeyword=true&includeSuggestions=true&t-search_query_source=direct_search`,
    },
    ca: {
        api: 'https://ca.carousell.com/ds/filter/cf/4.0/search/',
        baseUrl: 'https://ca.carousell.com',
        payload: {
            bestMatchEnabled: false,
            canChangeKeyword: false,
            ccid: '976',
            count: 48,
            countryCode: 'CA',
            countryId: '6251999',
            filters: [],
            includeBpEducationBanner: true,
            includeListingDescription: false,
            includePopularLocations: false,
            includeSuggestions: 'true',
            isCertifiedSpotlightEnabled: false,
            locale: 'en',
            prefill: { prefill_sort_by: '3' },
            // query: '',
            sortParam: { fieldName: '3' },
        },
        referer: (query) => `https://ca.carousell.com/search/${query}?addRecent=true&canChangeKeyword=true&includeSuggestions=true&t-search_query_source=direct_search`,
    },
    hk: {
        api: 'https://www.carousell.com.hk/ds/filter/cf/4.0/search/',
        baseUrl: 'https://www.carousell.com.hk',
        payload: {
            bestMatchEnabled: true,
            canChangeKeyword: false,
            ccid: '5365',
            count: 48,
            countryCode: 'HK',
            countryId: '1819730',
            filters: [],
            includeBpEducationBanner: true,
            includeListingDescription: false,
            includePopularLocations: false,
            includeSuggestions: 'true',
            isCertifiedSpotlightEnabled: false,
            locale: 'zh-Hant-HK',
            prefill: { prefill_sort_by: '3' },
            // query: '',
            sortParam: { fieldName: '3' },
        },
        referer: (query) => `https://www.carousell.com.hk/search/${query}?addRecent=true&canChangeKeyword=true&includeSuggestions=true&t-search_query_source=direct_search`,
    },
    id: {
        api: 'https://id.carousell.com/ds/filter/cf/4.0/search/',
        baseUrl: 'https://id.carousell.com',
        payload: {
            bestMatchEnabled: true,
            canChangeKeyword: false,
            ccid: '726',
            count: 48,
            countryCode: 'ID',
            countryId: '1643084',
            filters: [],
            includeBpEducationBanner: true,
            includeListingDescription: false,
            includePopularLocations: false,
            includeSuggestions: 'true',
            isCertifiedSpotlightEnabled: false,
            locale: 'id',
            prefill: { prefill_sort_by: '3' },
            // query: '',
            sortParam: { fieldName: '3' },
        },
        referer: (query) => `https://id.carousell.com/search/${query}?addRecent=true&canChangeKeyword=true&includeSuggestions=true&t-search_query_source=direct_search`,
    },
    my: {
        api: 'https://www.carousell.com.my/ds/filter/cf/4.0/search/',
        baseUrl: 'https://www.carousell.com.my',
        payload: {
            bestMatchEnabled: true,
            canChangeKeyword: false,
            ccid: '6003',
            count: 48,
            countryCode: 'MY',
            countryId: '1733045',
            filters: [{ boolean: { value: false }, fieldName: '_delivery' }],
            includeBpEducationBanner: true,
            includeListingDescription: false,
            includePopularLocations: false,
            includeSuggestions: 'true',
            isCertifiedSpotlightEnabled: true,
            locale: 'en',
            prefill: { prefill_sort_by: '3' },
            // query: '',
            sortParam: { fieldName: '3' },
        },
        referer: (query) => `https://www.carousell.com.my/search/${query}?addRecent=true&canChangeKeyword=true&includeSuggestions=true&t-search_query_source=direct_search`,
    },
    nz: {
        api: 'https://nz.carousell.com/ds/filter/cf/4.0/search/',
        baseUrl: 'https://nz.carousell.com',
        payload: {
            bestMatchEnabled: false,
            canChangeKeyword: false,
            ccid: '1414',
            count: 48,
            countryCode: 'NZ',
            countryId: '2186224',
            filters: [],
            includeBpEducationBanner: true,
            includeListingDescription: false,
            includePopularLocations: false,
            includeSuggestions: 'true',
            isCertifiedSpotlightEnabled: false,
            locale: 'en',
            prefill: { prefill_sort_by: '3' },
            // query: '',
            sortParam: { fieldName: '3' },
        },
        referer: (query) => `https://nz.carousell.com/search/${query}?addRecent=true&canChangeKeyword=true&includeSuggestions=true&t-search_query_source=direct_search`,
    },
    ph: {
        api: 'https://www.carousell.ph/ds/filter/cf/4.0/search/',
        baseUrl: 'https://www.carousell.ph',
        payload: {
            bestMatchEnabled: true,
            canChangeKeyword: 'true',
            ccid: '5050',
            count: 48,
            countryCode: 'PH',
            countryId: '1694008',
            filters: [],
            includeBpEducationBanner: true,
            includeListingDescription: false,
            includePopularLocations: false,
            includeSuggestions: 'true',
            isCertifiedSpotlightEnabled: false,
            locale: 'en',
            prefill: { prefill_sort_by: '3' },
            // query: '',
            sortParam: { fieldName: '3' },
        },
        referer: (query) => `https://www.carousell.ph/search/${query}?addRecent=true&canChangeKeyword=true&includeSuggestions=true&t-search_query_source=direct_search`,
    },
    sg: {
        api: 'https://www.carousell.sg/ds/filter/cf/4.0/search/',
        baseUrl: 'https://www.carousell.sg',
        payload: {
            bestMatchEnabled: true,
            canChangeKeyword: 'true',
            ccid: '5727',
            count: 48,
            countryCode: 'SG',
            countryId: '1880251',
            filters: [{ boolean: { value: false }, fieldName: '_delivery' }],
            includeBpEducationBanner: true,
            includeListingDescription: false,
            includePopularLocations: false,
            includeSuggestions: 'true',
            isCertifiedSpotlightEnabled: false,
            locale: 'en',
            prefill: { prefill_sort_by: '3' },
            // query: '',
            sortParam: { fieldName: '3' },
        },
        referer: (query) => `https://www.carousell.sg/search/${query}?addRecent=true&canChangeKeyword=true&includeSuggestions=true&t-search_query_source=direct_search`,
    },
    tw: {
        api: 'https://tw.carousell.com/ds/filter/cf/4.0/search/',
        baseUrl: 'https://tw.carousell.com',
        payload: {
            bestMatchEnabled: true,
            canChangeKeyword: false,
            ccid: '6445',
            count: 48,
            countryCode: 'TW',
            countryId: '1668284',
            filters: [],
            includeBpEducationBanner: true,
            includeListingDescription: false,
            includePopularLocations: false,
            includeSuggestions: 'true',
            isCertifiedSpotlightEnabled: false,
            locale: 'zh-Hant-TW',
            prefill: { prefill_sort_by: '3' },
            // query: '',
            sortParam: { fieldName: '3' },
        },
        referer: (query) => `https://tw.carousell.com/search/${query}?addRecent=true&canChangeKeyword=true&includeSuggestions=true&t-search_query_source=direct_search`,
    },
};

async function handler(ctx): Promise<Data> {
    const { region, keyword } = ctx.req.param();

    if (!Object.keys(regionMap).includes(region)) {
        throw new Error(`Unsupported region code: ${region}`);
    }

    const baseUrl = regionMap[region].baseUrl;
    const siteResponse = await ofetch.raw(baseUrl);
    const cookies = siteResponse.headers
        .getSetCookie()
        ?.map((c) => c.split(';')[0])
        .join('; ');
    const csrfToken = siteResponse._data.match(/"csrfToken":"(.*?)","/)[1];

    const response = await ofetch(regionMap[region].api, {
        method: 'POST',
        headers: {
            cookie: cookies,
            'csrf-token': csrfToken,
            referer: regionMap[region].referer(keyword),
        },
        body: {
            ...regionMap[region].payload,
            query: keyword,
        },
    });

    const items = response.data.results
        .filter((i) => i.listingCard)
        .map(({ listingCard: item }: { listingCard: ListingCard }) => ({
            title: item.title,
            description: `${item.photoUrls.map((url) => `<img src="${url.replace('_thumbnail.', '_progressive.')}">`).join('')}<br>${Object.values(item.belowFold)
                .map((v) => v.stringContent.replaceAll('\r', '<br>'))
                .join('<br>')}`,
            author: `${item.seller.firstName ?? ''} ${item.seller.lastName ?? ''} (@${item.seller.username})`.trim(),
            pubDate: parseDate(item.overlayContent.timestampContent.seconds.low, 'X'),
            guid: `${region}:${item.id}`,
            link: `${baseUrl}/p/${item.id}/`,
        })) satisfies DataItem[];

    return {
        title: `Carousell ${region.toUpperCase()} Search - ${keyword}`,
        item: items,
    };
}
