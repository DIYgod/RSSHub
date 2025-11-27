import path from 'node:path';

import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { art } from '@/utils/render';

const host = 'https://www.zagg.com/en_us';
export const route: Route = {
    path: '/new-arrivals/:query?',
    categories: ['shopping'],
    example: '/zagg/new-arrivals/brand=164&cat=3038,3041',
    parameters: { query: 'query, search page querystring' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'New Arrivals',
    maintainers: ['EthanWng97'],
    handler,
    description: `For instance, in \`https://www.zagg.com/en_us/new-arrivals?brand=164&cat=3038%2C3041\`, the query is \`brand=164&cat=3038%2C3041\``,
};

async function handler(ctx) {
    const query = ctx.req.param('query');
    const params = new URLSearchParams(query);
    const brands = params.get('brand');
    const categories = params.get('cat');

    const url = `${host}/new-arrivals`;
    const response = await got({
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
        },
        method: 'post',
        url,
        searchParams: {
            cat: categories,
            brand: brands,
        },
    });
    const products = response.data.products;

    const $ = load(products);
    const list = $('.item.product.product-item')
        .toArray()
        .map((element) => {
            const data = {};
            const details = $(element).find('.product.details-box').html();
            data.link = $(element).find('.product-item-link').eq(0).attr('href');
            data.title = $(element).find('.product-item-link').text();
            const regex = /(https.*?)\?/;
            const imgUrl = $(element).find('img').eq(0).attr('data-src').match(regex)[1];
            const img = art(path.join(__dirname, 'templates/new-arrivals.art'), {
                imgUrl,
            });
            data.description = details + img;
            return data;
        });
    return {
        title: 'Zagg - New Arrivals',
        link: response.url,
        description: 'Zagg - New Arrivals',
        item: list.map((item) => ({
            title: item.title,
            description: item.description,
            link: item.link,
        })),
    };
}
