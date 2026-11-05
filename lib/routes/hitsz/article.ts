import { type Cheerio, load } from 'cheerio';
import { type AnyNode, cloneNode, Document } from 'domhandler';
import type { Context } from 'hono';
import pMap from 'p-map';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import { getTenderFeed } from './tender';

function copyElements<T extends AnyNode>(selection: Cheerio<T>): Cheerio<T> {
    const copy = selection.map((_, element) => cloneNode(element, true));
    const root = new Document(copy.toArray());
    copy.each((_, element) => {
        element.parent = root;
    });
    return copy;
}

export const route: Route = {
    path: '/article/:category?',
    categories: ['university'],
    example: '/hitsz/article/id-77',
    parameters: { category: '分类名，默认为校园动态' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '新闻中心',
    maintainers: ['xandery-geek'],
    handler,
    description: `| 校区要闻 | 媒体报道 | 综合新闻 | 校园动态 | 讲座论坛 | 热点专题 | 招标信息 | 重要关注 |
| -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- |
| id-116   | id-80    | id-75    | id-77    | id-78    | id-79    | id-81    | id-124   |`,
};

const categories = {
    'id-116': '6',
    'id-80': '7',
    'id-75': '9',
    'id-77': '10',
    'id-78': 'jzlt',
    'id-79': '11',
    'id-124': '12',
} satisfies Record<string, string>;

const isCategory = (key: string): key is keyof typeof categories => Object.hasOwn(categories, key);

function parseCalendarDate(value: string) {
    if (!value) {
        return;
    }
    const date = parseDate(value, 'YYYY-MM-DD');
    return Number.isNaN(date.getTime()) ? undefined : timezone(date, 8);
}

async function handler(ctx: Context): Promise<Data> {
    const host = 'https://www.hitsz.edu.cn';
    const category = ctx.req.param('category') ?? 'id-77';
    if (category === 'id-81') {
        return getTenderFeed();
    }
    if (!isCategory(category)) {
        throw new InvalidParameterError('Unknown news category. Use one of the supported category IDs documented for this route.');
    }
    const link = new URL(`/news/${categories[category]}/list.htm`, host).href;
    const response = await got(link);
    const $ = load(response.data);
    const categoryName = $('title').text();
    const lists = $('.newsletters > li, .announcement > li, .lecture_n > li, .hot_topic > .topnews_item')
        .toArray()
        .map((el): DataItem & { link: string } => {
            const element = $(el);
            const anchor = element.find('a.title_o, .lecture_top a').first();
            const titleLink = anchor.length ? anchor : element.children('a').first();
            const itemLink = new URL(titleLink.attr('href')!, host).href;
            const summary = copyElements(element.find('.text').first());
            summary.find('.blue_text').remove();
            const cover = element.find('.img').first().html() || '';
            const description = cover + (summary.html() || '');
            const date = element.find('.date_t').text() || element.find('span.date').first().text();
            return {
                title: titleLink.text(),
                link: itemLink,
                description: description || undefined,
                pubDate: parseCalendarDate(date),
            };
        });

    const items = await pMap(
        lists,
        async (item) => {
            const itemUrl = new URL(item.link);
            if (itemUrl.hostname !== new URL(host).hostname || !itemUrl.pathname.endsWith('/page.htm')) {
                return item;
            }
            const detail = await cache.tryGet(item.link, async () => {
                const response = await got(item.link);
                const $ = load(response.data);
                const published = $('.detail_out .tip .item')
                    .filter((_, el) => $(el).text().startsWith('发布时间：'))
                    .first()
                    .text()
                    .replace('发布时间：', '');
                return {
                    description: $('.wp_articlecontent').html() ?? $('.edittext').html() ?? undefined,
                    pubDate: parseCalendarDate(published),
                };
            });
            return { ...item, description: detail.description || item.description, pubDate: detail.pubDate ?? item.pubDate };
        },
        { concurrency: 3 }
    );

    return {
        title: `哈尔滨工业大学（深圳）-${categoryName}`,
        link,
        description: `哈尔滨工业大学（深圳）-${categoryName}`,
        item: items,
    };
}
