import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const rootUrl = 'http://news.hrbeu.edu.cn';

export const route: Route = {
    path: '/gx/card/:column/:id?',
    categories: ['university'],
    example: '/hrbeu/gx/card/xw/ztch',
    parameters: {
        column: '主栏，如 `新闻：xw`，由 `URL` 中获取；',
        id: '次栏，如 `要闻：yw`，如果次栏存在，则为必选，由 `URL` 中获取。',
    },
    name: '工学新闻 - 卡片页面',
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

    const card = $('li.clearfix')
        .toArray()
        .map((item) => ({
            title: $(item).find('div.list-right-tt').text(),
            pubDate: parseDate($(item).find('.news-date-li').text(), 'DDYYYY-MM'),
            link: $(item).find('a').attr('href'),
            description: $(item).find('div.list-right-p').text(),
        }));

    return {
        title: '工学-' + bigTitle,
        link: toUrl,
        item: card,
    };
}
