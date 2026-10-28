import { load } from 'cheerio';
import type { Context } from 'hono';
import pMap from 'p-map';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import { selectItems } from '../utils';

const baseUrl = 'https://gs.dhu.edu.cn';

const map = {
    trend: '/7205/list.htm',
    notice: '/7206/list.htm',
    class: '/xkks/list.htm',
};
export const route: Route = {
    path: '/yjs/news/:type?',
    categories: ['university'],
    example: '/dhu/yjs/news/class',
    parameters: { type: '默认为 `class`' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '研究生院通知',
    maintainers: ['fox2049'],
    handler,
    description: `| 新闻动态 | 通知公告 | 选课考试 |
| -------- | -------- | -------- |
| trend    | notice   | class    |`,
};

async function handler(ctx: Context) {
    const type = ctx.req.param('type') || 'class';
    if (!Object.hasOwn(map, type)) {
        throw new InvalidParameterError('Invalid notification type. Use trend, notice, or class.');
    }
    const link = `${baseUrl}${map[type]}`;
    const { data: response } = await got(link);

    const $ = load(response);
    const list = $('.sub_list > li')
        .toArray()
        .map((item): DataItem & { link: string; pubDate: Date } => {
            const $item = $(item);
            const a = $item.find('a').first();
            return {
                title: a.attr('title')!,
                link: new URL(a.attr('href')!, baseUrl).href,
                pubDate: timezone(parseDate($item.find('span').text()), 8),
            };
        });

    // item content
    const items = await pMap(
        selectItems(list),
        (item) =>
            cache.tryGet(item.link!, async () => {
                const { data: response } = await got(item.link);
                const $ = load(response);
                item.description = $('.wp_articlecontent').html();
                return item;
            }),
        { concurrency: 3 }
    );

    return {
        title: '东华大学研究生-' + $('.Column_Name').text(),
        link,
        item: items,
    };
}
