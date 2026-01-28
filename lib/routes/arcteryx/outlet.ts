import type { Route } from '@/types';
import got from '@/utils/got';

import { renderProductDescription } from './templates/product-description';
import { generateRssData } from './utils';

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
    maintainers: ['EthanWng97'],
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
    const url = `${host}api/fredhopper/query`;
    const productUrl = `${host}shop/`;
    const pageUrl = `${host}c/${gender}`;
    const response = await got({
        method: 'get',
        url,
        searchParams: {
            fh_location: `//catalog01/en_CA/gender>{${gender}}`,
            fh_country: country,
            fh_review: 'lister',
            fh_view_size: 'all',
            fh_context_location: '//catalog01',
        },
    });
    const items = response.data.universes.universe[1]['items-section'].items.item.map((item, index, arr) => generateRssData(item, index, arr, country));

    return {
        title: `Arcteryx - Outlet(${country.toUpperCase()}) - ${gender.toUpperCase()}`,
        link: pageUrl,
        description: `Arcteryx - Outlet(${country.toUpperCase()}) - ${gender.toUpperCase()}`,
        item: items.map((item) => ({
            title: item.name,
            link: productUrl + item.slug,
            description: renderProductDescription(item),
        })),
    };
}
