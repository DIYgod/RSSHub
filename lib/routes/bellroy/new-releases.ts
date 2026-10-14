import type { Route } from '@/types';
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
    maintainers: ['IvanWng97'],
    handler,
    url: 'bellroy.com/collection/new-releases',
};

async function handler() {
    const host = 'https://bellroy.com';
    const [settings, context] = await Promise.all([got(`${host}/api/v1/customer/settings`), got(`${host}/api/v1/customer/context`)]);
    const productsHost = settings.data.applications['product-detail'].sources.products.host;
    const commerce = context.data.commerce_information;
    const url = `${productsHost}/v2/products`;
    const response = await got({
        method: 'get',
        url,
        searchParams: {
            currency_identifier: commerce.currency_identifier,
            channel: 'bellroy.com',
            price_role_identifier: commerce.price_list_identifier,
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
