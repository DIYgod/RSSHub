import type { Route } from '@/types';

import { getProductList } from './utils';

export const route: Route = {
    path: '/outlet/:country/:gender',
    categories: ['shopping'],
    example: '/arcteryx/outlet/us/mens',
    parameters: { country: 'country', gender: 'gender' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['outlet.arcteryx.com/:country/en/c/:gender'],
        },
    ],
    name: 'Outlet',
    maintainers: ['IvanWng97'],
    handler,
    description: `Country

| United States | Canada | United Kingdom |
| ------------- | ------ | -------------- |
| us            | ca     | gb             |

gender

| male | female |
| ---- | ------ |
| mens | womens |

::: tip
Parameter \`country\` can be found within the url of \`Arcteryx\` website.
:::`,
};

async function handler(ctx) {
    const { country, gender } = ctx.req.param();
    const host = `https://outlet.arcteryx.com/${country}/en/`;
    const productUrl = `${host}shop/`;
    const pageUrl = `${host}c/${gender}`;
    const items = await getProductList(pageUrl, productUrl);

    return {
        title: `Arcteryx - Outlet(${country.toUpperCase()}) - ${gender.toUpperCase()}`,
        link: pageUrl,
        description: `Arcteryx - Outlet(${country.toUpperCase()}) - ${gender.toUpperCase()}`,
        item: items,
    };
}
