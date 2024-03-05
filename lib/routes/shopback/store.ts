// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';

export default async (ctx) => {
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
        .map((_, item) => {
            item = $(item);

            return {
                title: item.attr('data-content-name'),
                author: item.attr('data-content-merchant'),
                description: `<p>${item.find('.mb-3').text()}</p>`,
                link: `${rootUrl}/login?redirect=/redirect/alink/${item.attr('data-content-id')}`,
            };
        })
        .get();

    ctx.set('data', {
        title: `${$('h1').text()} - ShopBack`,
        link: currentUrl,
        item: items,
    });
};
