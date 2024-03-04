// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import { art } from '@/utils/render';
import * as path from 'node:path';
import { load } from 'cheerio';
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
export default async (ctx) => {
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
        .map(function () {
            const data = {};
            data.title = $(this).find('.product-tile').data('tealium').product_name[0];
            let imgUrl = new URL($(this).find('[itemprop="image"]').attr('content'));
            imgUrl = extractSfrmUrl(imgUrl);

            const price = $(this).find('[itemprop="price"]').eq(0).text();
            data.link = host + '/' + $(this).find('[itemprop="url"]').attr('href');
            data.description =
                price +
                art(path.join(__dirname, 'templates/product-description.art'), {
                    imgUrl,
                });
            data.category = $(this).find('[itemprop="category"]').attr('content');
            return data;
        })
        .get();
    ctx.set('data', {
        title: `Patagonia - New Arrivals - ${category.toUpperCase()}`,
        link: `${host}/shop/${categoryMap[category][1]}`,
        description: `Patagonia - New Arrivals - ${category.toUpperCase()}`,
        item: list.map((item) => ({
            title: item.title,
            description: item.description,
            link: item.link,
            category: item.category,
        })),
    });
};
