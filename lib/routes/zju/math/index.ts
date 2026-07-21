import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const base = 'http://www.math.zju.edu.cn/';

const categoryMap = new Map([
    [0, { id: 'zytz/list.htm', title: '浙江大学数学科学院-重要通知' }],
    [1, { id: 'bkstz/list.htm', title: '浙江大学数学科学院-本科生' }],
    [2, { id: 'yjstz/list.htm', title: '浙江大学数学科学院-研究生' }],
    [3, { id: 'kytz/list.htm', title: '浙江大学数学科学院-科研' }],
    [4, { id: 'jxtz/list.htm', title: '浙江大学数学科学院-教学' }],
    [5, { id: '38069/list.htm', title: '浙江大学数学科学院-人事' }],
    [6, { id: 'gs/list.htm', title: '浙江大学数学科学院-公示' }],
]);

async function fetchNewsItemsByCategory(categoryId: string): Promise<DataItem[]> {
    const response = await got({
        method: 'get',
        url: new URL(categoryId, base).href,
    });

    const $ = load(response.data);

    return $('.news_list #wp_news_w12 li')
        .toArray()
        .map((item) => {
            const element = $(item);
            const link = element.find('a[href]').first().attr('href');
            const title = element.find('.title').text().trim() || element.find('a[href]').first().attr('title');
            const dateText = `${element.find('.date .y').text().trim()}-${element.find('.date .d').text().trim()}`;

            return {
                title,
                link: link ? new URL(link, base).href : undefined,
                pubDate: timezone(parseDate(dateText), 8),
            };
        })
        .filter((item): item is DataItem => Boolean(item.title && item.link));
}

async function enrichNewsItemWithDetails(item: DataItem, refererUrl: string): Promise<DataItem> {
    if (!item.link) {
        return item;
    }

    return await cache.tryGet(item.link, async () => {
        try {
            const response = await got({
                method: 'get',
                url: item.link,
                headers: {
                    Referer: refererUrl,
                },
            });

            const $ = load(response.data);
            const description = $('.wp_articlecontent').html();
            const infoText = $('.item_info').text();
            const author = infoText.match(/来源：([\s\S]*?)发布时间：/)?.[1]?.trim();
            const pubDate = infoText.match(/发布时间：(\d{4}-\d{2}-\d{2})/)?.[1];

            if (description) {
                item.description = description;
            }

            if (author) {
                item.author = author;
            }

            if (pubDate) {
                item.pubDate = timezone(parseDate(pubDate), 8);
            }

            return item;
        } catch {
            return item;
        }
    });
}

export const route: Route = {
    path: '/math/:type',
    categories: ['university'],
    example: '/zju/math/0',
    parameters: { type: '分类，见下表' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '数学科学学院',
    description: `| 重要通知 | 本科生 | 研究生 | 科研 | 教学 | 人事 | 公示 |
| -------- | ------ | ------ | ---- | ---- | ---- | ---- |
| 0        | 1      | 2      | 3    | 4    | 5    | 6    |`,
    maintainers: ['Alex222222222222'],
    handler,
    url: 'www.math.zju.edu.cn',
};

async function handler(ctx: { req: { param: (arg0: string) => string } }) {
    const type = Math.trunc(Number(ctx.req.param('type')));
    const categoryInfo = categoryMap.get(type);

    if (!categoryInfo) {
        const validTypes = [...categoryMap.keys().toArray()].join(', ');
        throw new Error(`Invalid type: ${type}. Valid types are: ${validTypes}`);
    }

    const categoryUrl = new URL(categoryInfo.id, base).href;
    const newsItems = await fetchNewsItemsByCategory(categoryInfo.id);
    const items = await Promise.all(newsItems.map((item) => enrichNewsItemWithDetails(item, categoryUrl)));

    return {
        title: categoryInfo.title,
        link: categoryUrl,
        item: items,
    };
}
