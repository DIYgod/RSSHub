import type { Context } from 'hono';

import type { DataItem, Route } from '@/types';
import { getPlaywrightPage } from '@/utils/playwright';

export const route: Route = {
    path: '/:query',
    categories: ['other'],
    example: '/autotrader/radius=50&postcode=sw1a1aa&price-to=9000&year-from=2012&body-type=Hatchback&transmission=Automatic&exclude-writeoff-categories=on',
    parameters: { query: 'the search query' },
    features: {
        requirePuppeteer: true,
    },
    description: `1. Conduct a search with desired filters on AutoTrader
2. Copy everything in the URL after \`?\`, for example: \`https://www.autotrader.co.uk/car-search?radius=50&postcode=sw1a1aa&price-to=9000&year-from=2012&body-type=Hatchback&transmission=Automatic&exclude-writeoff-categories=on\` will produce \`radius=50&postcode=sw1a1aa&price-to=9000&year-from=2012&body-type=Hatchback&transmission=Automatic&exclude-writeoff-categories=on\``,
    name: 'Search',
    maintainers: ['HenryQW'],
    handler,
};

const rootUrl = 'https://www.autotrader.co.uk';

const filterNames: Record<string, string> = {
    'body-type': 'body_type',
    'exclude-writeoff-categories': 'is_writeoff',
    'fuel-type': 'fuel_type',
    'price-from': 'min_price',
    'price-to': 'max_price',
    radius: 'distance',
    'year-from': 'min_year_manufactured',
    'year-to': 'max_year_manufactured',
};

const gqlQuery = /* GraphQL */ `
    query SearchResultsListingsGridQuery($filters: [FilterInput!]!, $channel: Channel!, $page: Int, $sortBy: SearchResultsSort, $searchId: String!) {
        searchResults(input: { facets: [], filters: $filters, channel: $channel, page: $page, sortBy: $sortBy, searchId: $searchId }) {
            listings {
                ... on SearchListing {
                    advertId
                    title
                    subTitle
                    attentionGrabber
                    price
                    vehicleLocation
                    images
                    sellerType
                }
            }
        }
    }
`;

type Listing = {
    advertId?: string;
    title?: string;
    subTitle?: string;
    attentionGrabber?: string;
    price?: string;
    vehicleLocation?: string;
    images?: string[];
    sellerType?: string;
};

async function handler(ctx: Context) {
    const { query } = ctx.req.param();
    const searchParams = new URLSearchParams(query);

    const filters = [{ filter: 'price_search_type', selected: ['total'] }];
    const keys = new Set(searchParams.keys());
    for (const key of keys) {
        if (key === 'page' || key === 'sort') {
            continue;
        }
        const filter = filterNames[key] ?? key.replaceAll('-', '_');
        // `exclude-writeoff-categories=on` is the only toggle, its filter takes `exclude`
        const selected = filter === 'is_writeoff' ? ['exclude'] : searchParams.getAll(key);
        filters.push({ filter, selected });
    }

    const link = `${rootUrl}/car-search?${query}`;
    const { page, destroy } = await getPlaywrightPage(link);

    let listings: Listing[];
    try {
        listings = await page.evaluate(
            async ({ gqlQuery, filters, page, sortBy }) => {
                const response = await fetch('/at-gateway?opname=SearchResultsListingsGridQuery', {
                    method: 'POST',
                    headers: {
                        'content-type': 'application/json',
                        'x-sauron-app-name': 'sauron-search-results-app',
                    },
                    body: JSON.stringify([
                        {
                            operationName: 'SearchResultsListingsGridQuery',
                            variables: {
                                filters,
                                channel: 'cars',
                                page,
                                sortBy,
                                searchId: '00000000-0000-0000-0000-000000000000',
                            },
                            query: gqlQuery,
                        },
                    ]),
                });
                const data = await response.json();
                return data[0].data.searchResults.listings;
            },
            {
                gqlQuery,
                filters,
                page: Number(searchParams.get('page')) || 1,
                sortBy: searchParams.get('sort') ?? 'relevance',
            }
        );
    } finally {
        await destroy();
    }

    const items: DataItem[] = listings
        .filter((listing) => listing.advertId)
        .map((listing) => ({
            title: `「${listing.price}」${listing.title} ${listing.subTitle}`,
            description: [listing.attentionGrabber, `${listing.vehicleLocation} · ${listing.sellerType}`, ...(listing.images ?? []).map((image) => `<img src="${image.replace('{resize}', 'w1024')}">`)].join('<br>'),
            link: `${rootUrl}/car-details/${listing.advertId}`,
            guid: listing.advertId,
        }));

    return {
        title: 'Auto Trader',
        link,
        item: items,
    };
}
