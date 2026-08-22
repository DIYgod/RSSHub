import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const listUrl = 'https://it.swufe.edu.cn/index/';

const map = new Map([
    ['xyxw', { title: '西南财经大学经济信息工程学院 -- 学院新闻', suffix: 'xyxw.htm' }],
    ['tzgg', { title: '西南财经大学经济信息工程学院 -- 通知公告', suffix: 'tzgg.htm' }],
]);

export const route: Route = {
    path: '/seie/:type?',
    categories: ['university'],
    example: '/swufe/seie/tzgg',
    parameters: { type: '分类名，默认为 tzgg' },
    radar: [
        { source: ['it.swufe.edu.cn/index/tzgg.htm'], target: '/seie/tzgg' },
        { source: ['it.swufe.edu.cn/index/xyxw.htm'], target: '/seie/xyxw' },
    ],
    name: '经济信息工程学院',
    maintainers: ['Hivol'],
    handler,
    description: `| 学院新闻 | 通知公告 |
| -------- | -------- |
| xyxw     | tzgg     |`,
};

async function handler(ctx: Context) {
    const { type = 'tzgg' } = ctx.req.param();
    const { title, suffix } = map.get(type)!;

    const link = listUrl + suffix;
    const response = await ofetch(link);
    const $ = load(response);

    const list = $('.article_list_item_content_title')
        .toArray()
        .map((elem) => {
            const $elem = $(elem);
            return {
                link: new URL($elem.find('a').attr('href')!, link).href,
                title: $elem.find('a').text(),
                date: $elem.find('span').text(),
            };
        });

    const items = await Promise.all(
        list.map((info) =>
            cache.tryGet(info.link, async () => {
                const response = await ofetch(info.link);
                const $ = load(response);

                const content = $('.article-main');
                content.find('img[orisrc]').each((_, img) => {
                    const $img = $(img);
                    $img.attr('src', $img.attr('orisrc')!);
                    $img.removeAttr('orisrc');
                });

                return {
                    title: info.title,
                    link: info.link,
                    description: content.html()!.trim(),
                    pubDate: timezone(parseDate(info.date), 8),
                };
            })
        )
    );

    return {
        title,
        link,
        description: '西南财经大学经济信息工程学院RSS',
        item: items,
    };
}
