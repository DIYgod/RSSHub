import type { Route } from '@/types';

import { getProductList } from './utils';

export const route: Route = {
    path: '/new-arrivals/:country/:gender',
    categories: ['shopping'],
    example: '/arcteryx/new-arrivals/us/mens',
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
            source: ['arcteryx.com/:country/en/c/:gender/new-arrivals'],
        },
    ],
    name: 'New Arrivals',
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
    const host = `https://arcteryx.com/${country}/en/`;
    const productUrl = `${host}shop/`;
    const pageUrl = `${host}c/${gender}/new-arrivals`;
    const items = await getProductList(pageUrl, productUrl);

    return {
        title: `Arcteryx - New Arrivals(${country.toUpperCase()}) - ${gender.toUpperCase()}`,
        link: pageUrl,
        description: `Arcteryx - New Arrivals(${country.toUpperCase()}) - ${gender.toUpperCase()}`,
        item: items,
    };
}
