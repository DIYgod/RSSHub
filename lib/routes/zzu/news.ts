import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { getRouteLimit } from '@/utils/route-limit';
import { parseDate } from '@/utils/time';

export const route: Route = {
    path: '/news/:type',
    categories: ['university'],
    example: '/zzu/news/ywsd',
    parameters: { type: '分类名' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['news.zzu.edu.cn/'],
        },
    ],
    name: '新闻网',
    maintainers: ['nia3y', 'amandus1990'],
    handler,
    description: `| 要闻速递 | 教学科研 | 基层动态 | 媒体郑大 |
| -------- | -------- | -------- | -------- |
| ywsd     | jxky     | jcdt     | mtzd     |`,
};
async function handler(ctx) {
    const type = ctx.req.param('type');
    const typeDict = {
        ywsd: [
            '要闻速递', // Category name
            'https://news.zzu.edu.cn/ywsd.htm', // News listing URL
        ],
        jxky: ['教学科研', 'https://news.zzu.edu.cn/jxky.htm'],
        jcdt: ['基层动态', 'https://news.zzu.edu.cn/jcdt.htm'],
        mtzd: ['媒体郑大', 'https://news.zzu.edu.cn/mtzd.htm'],
    };
    // Fetch the listing page
    const response = await got(typeDict[type][1]);
    const $ = load(response.data);
    // Extract article metadata from the listing
    const list: Array<
        DataItem & {
            link: string;
        }
    > = $('.new-item')
        .slice(0, Math.max(15, getRouteLimit(ctx, 15)))
        .toArray()
        .map((element) => {
            const $element = $(element);
            const $link = $element.find('h3 a');
            const link = new URL($link.attr('href')!, typeDict[type][1]).href;
            const title = $link.attr('title') || $link.text();
            // Read the publication date
            const pubDateText = $element.find('.new-date').text();
            // Read the listing summary
            const description = $element.find('p a').text().trim();
            return {
                title,
                link,
                description,
                pubDate: parseDate(pubDateText),
            };
        });
    const items = await pMap(
        list,
        (item) =>
            cache.tryGet(item.link, async () => {
                const response = await got(item.link);
                const $ = load(response.data);
                item.author =
                    $('.notice-detail-info-text:contains("信息来源：")')
                        .text()
                        .replace(/^\s*信息来源：/, '')
                        .replaceAll(/\s+/g, ' ')
                        .trim() || undefined;
                item.description = $('.v_news_content').html() || item.description;
                return item;
            }),
        { concurrency: 3 }
    );
    return {
        title: `郑大新闻网-${typeDict[type][0]}`,
        link: typeDict[type][1],
        item: items,
    };
}
