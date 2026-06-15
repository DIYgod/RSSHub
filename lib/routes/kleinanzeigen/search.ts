import type { Context } from 'hono';

import type { Data, Route } from '@/types';

import { search } from './utils/search';

export const route: Route = {
    path: '/search/:routeParams',
    categories: ['shopping'],
    example: '/kleinanzeigen/search/category=PCs&location=Berlin&radius=20',
    parameters: {
        routeParams: 'Extra parameters, see the table below',
    },
    description: `::: tip
Parameter

| Name            | Description                                                               | Default       |
| --------------- | ------------------------------------------------------------------------- | ------------- |
| query           | Search Query                                                              | undefined     |
| category        | Category (as named on Kleinanzeigen)                                      | undefined     |
| categoryId      | Category ID (advanced)                                                    | undefined     |
| location        | Location (as named on Kleinanzeigen)                                      | undefined     |
| locationId      | Location ID (advanced)                                                    | undefined     |
| radius          | Radius in KM around the Location                                          | 0             |
| sortingField    | Order of the Products (SORTING\\_DATE, PRICE\\_AMOUNT, PRICE\\_AMOUNT\\_DESC) | SORTING\\_DATE |
| minPrice        | minimal Price                                                             | undefined     |
| maxPrice        | maximal Price                                                             | undefined     |
| shippingCarrier | Shipping Carrier (e.g. DHL, HERMES)                                       | undefined     |

:::`,
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [],
    name: 'Search',
    maintainers: ['LunyaaDev'],
    handler,
};

function handler(ctx: Context): Promise<Data> {
    const { routeParams } = ctx.req.param();
    const params = new URLSearchParams(routeParams);

    return search({
        query: params.get('query') || undefined,
        category: params.get('category') || undefined,
        categoryId: params.get('categoryId') || undefined,
        location: params.get('location') || undefined,
        locationId: params.get('locationId') || undefined,
        radius: params.get('radius') || undefined,
        sortingField: params.get('sortingField') || undefined,
        minPrice: params.get('minPrice') || undefined,
        maxPrice: params.get('maxPrice') || undefined,
        shippingCarrier: params.get('shippingCarrier') || undefined,
    });
}
