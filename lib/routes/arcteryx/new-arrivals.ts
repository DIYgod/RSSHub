import { Route } from '@/types';

import got from '@/utils/got';
import { art } from '@/utils/render';
import path from 'node:path';
import { generateRssData } from './utils';

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
    const host = `https://arcteryx.com/${country}/en/`;
    const url = `${host}api/fredhopper/query`;
    const productUrl = `${host}shop/`;
    const pageUrl = `${host}c/${gender}/new-arrivals`;
    const response = await got({
        method: 'get',
        url,
        searchParams: {
            fh_location: `//catalog01/en_CA/gender>{${gender}}/intended_use>{newarrivals}`,
            fh_country: country,
            fh_view_size: 'all',
        },
    });
    const items = response.data.universes.universe[1]['items-section'].items.item.map((item, index, arr) => generateRssData(item, index, arr, country));

    return {
        title: `Arcteryx - New Arrivals(${country.toUpperCase()}) - ${gender.toUpperCase()}`,
        link: pageUrl,
        description: `Arcteryx - New Arrivals(${country.toUpperCase()}) - ${gender.toUpperCase()}`,
        item: items.map((item) => ({
            title: item.name,
            link: productUrl + item.slug,
            description: art(path.join(__dirname, 'templates/product-description.art'), {
                item,
            }),
        })),
    };
}
