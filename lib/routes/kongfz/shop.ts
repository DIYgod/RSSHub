import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/shop/:id/:cat?',
    categories: ['reading'],
    example: '/kongfz/shop/10067/1',
    parameters: {
        id: '店铺 id, 可在对应店铺页 URL 中找到',
        cat: '分类 id，可在对应分类页 URL 中找到，默认为店铺最新上架',
    },
    name: '店铺上架',
    maintainers: ['nczitzk'],
    handler,
};

async function handler(ctx: Context) {
    const { id, cat } = ctx.req.param();
    const shopUrl = `http://shop.kongfz.com/${id}${cat ? `/cat_${cat}` : ''}`;

    const shopResponse = await ofetch(shopUrl);
    const $ = load(shopResponse);

    const list = $(cat ? 'div.list-content div.item-row' : 'div.newest_content span.rareBook_content_list')
        .slice(0, 15)
        .toArray()
        .map((item) => {
            const $item = $(item);
            const a = cat ? $item.find('a').eq(0) : $item.find('div.rareBook_content_title a');
            return {
                title: $item.text(),
                link: a.attr('href'),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link!, async () => {
                const detailResponse = await ofetch(item.link!);
                const content = load(detailResponse);

                content('#eventreport').remove();
                content('div.buy-group').remove();
                content('div.weixin-popup-bg').remove();

                return {
                    ...item,
                    description: content('div.major-function').html() + `<img src="${content('ul.lg-list li img').attr('src')}">`,
                    pubDate: timezone(parseDate(content('span.up-book-date-time').text()), 8),
                };
            })
        )
    );

    const titleSplit = $('title').text().split('_');

    return {
        title: `孔夫子旧书网 - ${titleSplit.at(-2)}`,
        link: shopUrl,
        item: items,
    };
}
