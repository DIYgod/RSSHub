import { load } from 'cheerio';
import type { Context } from 'hono';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/wehdz/:caty',
    categories: ['government'],
    example: '/gov/wuhan/wehdz/tz_68628',
    parameters: {
        caty: '类别',
    },
    name: '武汉东湖新技术开发区 - 光谷新闻',
    maintainers: ['tudou027'],
    handler,
    description: `|  通知公告 |   光谷要闻  |   产业动态  |
| :-------: | :---------: | :---------: |
| tz\\_68628 | ggxw\\_68629 | cydt\\_68630 |`,
};

const rootUrl = 'https://www.wehdz.gov.cn';

async function handler(ctx: Context) {
    const { caty } = ctx.req.param();

    const currentUrl = `${rootUrl}/2022/ggxw_68627/${caty}/`;
    const response = await ofetch(currentUrl);

    const $ = load(response);
    const list = $('.list01-content-containerRight li')
        .slice(0, 20)
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);
            const a = $item.find('a[href]');
            return {
                title: a.text(),
                link: new URL(a.attr('href')!, currentUrl).href,
                pubDate: parseDate($item.find('span').text(), 'YYYY-MM-DD'),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link!, async () => {
                const res = await ofetch(item.link!);
                const content = load(res);

                item.description = content('div.content_article').html();
                return item;
            })
        )
    );

    return {
        title: `武汉东湖高新 - ${$('head title').text().trim()}`,
        link: currentUrl,
        item: items,
    };
}
