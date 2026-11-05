import { load } from 'cheerio';
import type { Context } from 'hono';
import pMap from 'p-map';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const listUrl = 'https://it.swufe.edu.cn/index/';

const map = new Map([
    ['xyxw', { title: '西南财经大学计算机与人工智能学院 -- 学院新闻', suffix: 'xyxw.htm' }],
    ['tzgg', { title: '西南财经大学计算机与人工智能学院 -- 通知公告', suffix: 'tzgg.htm' }],
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
    name: '计算机与人工智能学院',
    maintainers: ['Hivol'],
    handler,
    description: `| 学院新闻 | 通知公告 |
| -------- | -------- |
| xyxw     | tzgg     |`,
};

async function getArticle(link: string): Promise<Pick<DataItem, 'description' | 'pubDate'>> {
    const response = await ofetch(link);
    const $ = load(response);

    const content = $('.article-main');
    content.find('.cont-shar').remove();
    content.find('img[orisrc]').each((_, img) => {
        const $img = $(img);
        $img.attr('src', $img.attr('orisrc')!);
        $img.removeAttr('orisrc');
    });
    const publishedAt = $('.article-date').text().trim();
    return {
        description: content.html()!.trim(),
        ...(publishedAt && { pubDate: timezone(parseDate(publishedAt, 'YYYY年MM月DD日 HH:mm'), 8) }),
    };
}

async function handler(ctx: Context) {
    const { type = 'tzgg' } = ctx.req.param();
    const column = map.get(type);
    if (!column) {
        throw new InvalidParameterError('Unsupported column. Use xyxw or tzgg.');
    }
    const { title, suffix } = column;

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

    const items = await pMap(
        list,
        async (info) => ({
            title: info.title,
            link: info.link,
            pubDate: info.date.trim() ? timezone(parseDate(info.date), 8) : undefined,
            ...(await cache.tryGet(`swufe:seie:article:v3:${info.link}`, () => getArticle(info.link))),
        }),
        { concurrency: 3 }
    );

    return {
        title,
        link,
        description: '西南财经大学计算机与人工智能学院RSS',
        item: items,
    };
}
