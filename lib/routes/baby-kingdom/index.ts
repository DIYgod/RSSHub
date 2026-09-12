import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/:id/:order?',
    categories: ['other'],
    example: '/baby-kingdom/19/view',
    parameters: { id: '板块id，可在 URL 中找到', order: '排序方式' },
    description: `| 发帖时间 | 回复 / 查看 | 查看 | 最后发表 | 热门 |
| -------- | ----------- | ---- | -------- | ---- |
| dateline | reply       | view | lastpost | heat |`,
    name: '板块',
    maintainers: ['LogicJake'],
    handler,
};

const host = 'https://www.baby-kingdom.com';

async function handler(ctx: Context) {
    const { id, order } = ctx.req.param();

    let link = `${host}/forum.php?mod=forumdisplay&fid=${id}`;

    switch (order) {
        case 'dateline':
            link += '&filter=author&orderby=dateline';
            break;

        case 'reply':
            link += '&filter=reply&orderby=replies';
            break;

        case 'view':
            link += '&filter=reply&orderby=views';
            break;

        case 'lastpost':
            link += '&filter=lastpost&orderby=lastpost';
            break;

        case 'heat':
            link += '&filter=heat&orderby=heats';
            break;

        default:
        // Do nothing
    }

    const response = await ofetch(link);
    const $ = load(response);

    const title = $('h1.xs2 a').text();
    const out = $('tbody[id^="normalthread"]')
        .toArray()
        .map((item) => {
            const $item = $(item);
            return {
                title: $item.find('td:nth-child(2) > a:nth-child(1)').text(),
                link: new URL($item.find('td:nth-child(2) > a:nth-child(1)').attr('href')!, host).href,
                author: $item.find('td.by.by_author cite a').text(),
                pubDate: parseDate($item.find('td.by.by_author em').text(), 'YY-M-D'),
            };
        });

    return {
        title: `${title}-親子王國`,
        link,
        item: out,
    };
}
