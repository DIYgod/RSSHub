import path from 'node:path';

import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { art } from '@/utils/render';

const host = 'https://www.patagonia.com';
const categoryMap = {
    mens: ['mens-new', 'mens-new-arrivals'],
    womens: ['womens-new', 'womens-new-arrivals'],
    kids: ['kids-new-arrivals', 'kids-baby-new-arrivals'],
    luggage: ['luggage-new-arrivals', 'luggage-new-arrivals'],
};
function extractSfrmUrl(url) {
    const urlObj = new URL(url);
    const sfrmValue = urlObj.searchParams.get('sfrm');
    urlObj.search = new URLSearchParams({ sfrm: sfrmValue }).toString();
    return urlObj.toString();
}
export const route: Route = {
    path: '/new-arrivals/:category',
    categories: ['shopping'],
    example: '/patagonia/new-arrivals/mens',
    parameters: { category: 'category, see below' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'New Arrivals',
    maintainers: [],
    handler,
    description: `| Men's | Women's | Kids' & Baby | Packs & Gear |
| ----- | ------- | ------------ | ------------ |
| mens  | womens  | kids         | luggage      |`,
};

async function handler(ctx) {
    const category = ctx.req.param('category');
    const url = `${host}/on/demandware.store/Sites-patagonia-us-Site/en_US/Search-LazyGrid`;
    const response = await got({
        method: 'get',
        url,
        searchParams: {
            cgid: categoryMap[category][0],
            isLazyGrid: true,
        },
    });
    const data = response.data;

    const $ = load(data);
    const list = $('.product')
        .toArray()
        .map((element) => {
            const data = {
                title: $(element).find('.product-tile').data('tealium').product_name[0],
                link: host + '/' + $(element).find('[itemprop="url"]').attr('href'),
                description: '',
                category: $(element).find('[itemprop="category"]').attr('content'),
            };
            let imgUrl = new URL($(element).find('[itemprop="image"]').attr('content'));
            imgUrl = extractSfrmUrl(imgUrl);

            const price = $(element).find('[itemprop="price"]').eq(0).text();
            data.description =
                price +
                art(path.join(__dirname, 'templates/product-description.art'), {
                    imgUrl,
                });
            return data;
        });
    return {
        title: `Patagonia - New Arrivals - ${category.toUpperCase()}`,
        link: `${host}/shop/${categoryMap[category][1]}`,
        description: `Patagonia - New Arrivals - ${category.toUpperCase()}`,
        item: list,
    };
}
