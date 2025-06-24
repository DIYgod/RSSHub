import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';

export const route: Route = {
    path: '/:store',
    categories: ['shopping'],
    example: '/shopback/shopee-mart',
    parameters: { store: 'Store, can be found in URL' },
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
            source: ['shopback.com.tw/:category', 'shopback.com.tw/'],
        },
    ],
    name: 'Store',
    maintainers: ['nczitzk'],
    handler,
};

async function handler(ctx) {
    const store = ctx.req.param('store');

    const rootUrl = 'https://www.shopback.com.tw';
    const currentUrl = `${rootUrl}/${store}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    $('table').remove();

    const items = $('div[data-content-name]')
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.attr('data-content-name'),
                author: item.attr('data-content-merchant'),
                description: `<p>${item.find('.mb-3').text()}</p>`,
                link: `${rootUrl}/login?redirect=/redirect/alink/${item.attr('data-content-id')}`,
            };
        });

    return {
        title: `${$('h1').text()} - ShopBack`,
        link: currentUrl,
        item: items,
    };
}
