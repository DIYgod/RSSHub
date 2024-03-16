import { Route } from '@/types';
import got from '@/utils/got';

export const route: Route = {
    path: '/new-releases',
    categories: ['shopping'],
    example: '/bellroy/new-releases',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['bellroy.com/collection/new-releases', 'bellroy.com/'],
        },
    ],
    name: 'New Releases',
    maintainers: ['EthanWng97'],
    handler,
    url: 'bellroy.com/collection/new-releases',
};

async function handler() {
    const host = 'https://bellroy.com';
    const url = 'https://production.products.boobook-services.com/products';
    const response = await got({
        method: 'get',
        url,
        searchParams: {
            currency_identifier: '1abe985632a1392e6a94b885fe193d5943b7c213',
            price_group: 'bellroy.com',
            'filter[dimensions][web_new_release]': 'new_style',
        },
    });
    const data = response.data.products;

    return {
        title: 'Bellroy - New Releases',
        link: 'https://bellroy.com/collection/new-releases',
        description: 'Bellroy - New Releases',
        item: data.map((item) => ({
            title: item.attributes.name + ' - ' + item.attributes.dimensions.color,
            link: host + item.attributes.canonical_uri,
        })),
    };
}
