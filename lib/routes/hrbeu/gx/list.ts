import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const rootUrl = 'http://news.hrbeu.edu.cn';

export const route: Route = {
    path: '/gx/list/:column/:id?',
    categories: ['university'],
    example: '/hrbeu/gx/list/xw/yw',
    parameters: {
        column: '主栏，如 `新闻：xw`，由 `URL` 中获取；',
        id: '次栏，如 `要闻：yw`，如果次栏存在，则为必选，由 `URL` 中获取。',
    },
    name: '工学新闻 - 列表页面',
    maintainers: ['Derekmini', 'XYenon'],
    handler,
};

async function handler(ctx) {
    const column = ctx.req.param('column');
    const id = ctx.req.param('id') || '';
    const toUrl = id === '' ? `${rootUrl}/${column}.htm` : `${rootUrl}/${column}/${id}.htm`;

    const response = await got(toUrl);

    const $ = load(response.data);

    const bigTitle = $('div.list-left-tt')
        .text()
        .replaceAll(/[\n\r ]/g, '');

    const list = $('li.txt-elise')
        .toArray()
        .map((item) => {
            let link = $(item).find('a').attr('href');
            if (link.includes('info') && id !== '') {
                link = new URL(link, rootUrl).href;
            }
            if (link.includes('info') && id === '') {
                link = `${rootUrl}/${link}`;
            }
            return {
                title: $(item).find('a').attr('title'),
                pubDate: parseDate($(item).find('span').text()),
                link,
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                if (item.link.includes('info')) {
                    const detailResponse = await got(item.link);
                    const content = load(detailResponse.data);
                    item.description = content('div.v_news_content').html();
                } else {
                    item.description = '本文需跳转，请点击标题后阅读';
                }
                return item;
            })
        )
    );

    return {
        title: '工学-' + bigTitle,
        link: toUrl,
        item: items,
    };
}
