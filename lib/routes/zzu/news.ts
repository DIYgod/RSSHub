import { load } from 'cheerio';
import { FetchError } from 'ofetch';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

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
class ArticleUnavailableError extends Error {
    constructor(public author?: string) {
        super('Article content is unavailable');
    }
}
function parsePublishedDate(value?: string) {
    if (!value) {
        return;
    }
    const match = value.match(/^\s*(\d{4})[-/](\d{1,2})[-/](\d{1,2})(?:\s|T|$)/);
    if (!match) {
        return;
    }
    const calendarDate = `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`;
    if (!Number.isFinite(parseDate(calendarDate, 'YYYY-MM-DD', true).getTime())) {
        return;
    }
    const date = parseDate(Date.parse(value));
    return Number.isFinite(date.getTime()) ? date : undefined;
}
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
                pubDate: parsePublishedDate(pubDateText),
            };
        });
    const items = await pMap(
        list,
        async (item) => {
            try {
                const details = await cache.tryGet(`zzu:news:details:v4:${item.link}`, async () => {
                    const response = await got(item.link);
                    const $ = load(response.data);
                    const author =
                        $('.notice-detail-info-text:contains("信息来源：")')
                            .text()
                            .replace(/^\s*信息来源：/, '')
                            .replaceAll(/\s+/g, ' ')
                            .trim() || undefined;
                    const description = $('.v_news_content').html();
                    if (!description?.trim()) {
                        throw new ArticleUnavailableError(author);
                    }
                    return { author, description };
                });
                return { ...item, author: details.author, description: details.description || item.description };
            } catch (error) {
                if (error instanceof ArticleUnavailableError) {
                    return { ...item, author: error.author };
                }
                if (error instanceof FetchError) {
                    return item;
                }
                throw error;
            }
        },
        { concurrency: 3 }
    );
    return {
        title: `郑大新闻网-${typeDict[type][0]}`,
        link: typeDict[type][1],
        item: items,
    };
}
