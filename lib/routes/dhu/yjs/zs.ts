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

const baseUrl = 'https://yjszs.dhu.edu.cn';

const map = {
    doctor: '/7126/list.htm',
    master: '/7128/list.htm',
};
export const route: Route = {
    path: '/yjs/zs/:type?',
    categories: ['university'],
    example: '/dhu/yjs/zs/master',
    parameters: { type: '默认为 `master`' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '研究生招生信息',
    maintainers: ['fox2049'],
    handler,
    description: `| 博士招生 | 硕士招生 |
| -------- | -------- |
| doctor   | master   |`,
};

async function handler(ctx: Context) {
    const type = ctx.req.param('type') || 'master';
    if (!Object.hasOwn(map, type)) {
        throw new InvalidParameterError('Invalid notification type. Use doctor or master.');
    }
    const link = `${baseUrl}${map[type]}`;
    const { data: response } = await got(link);

    const $ = load(response);
    const list = $('.list_item, .col_news_list .news_list > li')
        .toArray()
        .map((item): DataItem & { link: string; pubDate: Date } => {
            const $item = $(item);
            const a = $item.find('a').first();
            const date = $item.find('.Article_PublishDate').text() || `${$item.find('.news_year').text()}-${$item.find('.news_day').text()}`;
            return {
                title: a.attr('title') || $item.find('.news_title').text(),
                link: new URL(a.attr('href')!, baseUrl).href,
                pubDate: timezone(parseDate(date, 'YYYY-MM-DD'), 8),
            };
        });

    // item content
    const items = await pMap(
        selectItems(list),
        (item) =>
            cache.tryGet(item.link!, async () => {
                const { data: response } = await got(item.link);
                const $ = load(response);
                item.description = $('.wp_articlecontent').first().html();
                return item;
            }),
        { concurrency: 3 }
    );

    return {
        title: '东华大学研究生-' + $('.col_title').text(),
        link,
        item: items,
    };
}
