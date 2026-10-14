import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import logger from '@/utils/logger';
import { parseDate } from '@/utils/parse-date';
import parser from '@/utils/rss-parser';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/archives',
    categories: ['blog'],
    example: '/enterprisecraftsmanship/archives',
    radar: [
        {
            source: ['enterprisecraftsmanship.com/archives/'],
        },
    ],
    url: 'enterprisecraftsmanship.com/',
    name: 'Archives',
    maintainers: ['liyaozhong'],
    handler,
    description: 'Enterprise Craftsmanship blog archives',
};

async function handler() {
    const rootUrl = 'https://enterprisecraftsmanship.com';
    const currentUrl = `${rootUrl}/archives`;

    const response = await got(currentUrl);

    const $ = load(response.data);
    let publishedDates: Record<string, string> = {};
    try {
        publishedDates = await cache.tryGet(`${rootUrl}/index.xml:publishedDates`, async () => {
            const feed = await parser.parseURL(`${rootUrl}/index.xml`);
            return Object.fromEntries(feed.items.filter((item) => item.link && item.pubDate).map((item) => [item.link!, item.pubDate!]));
        });
    } catch (error) {
        logger.warn(`Failed to fetch publication dates: ${error}`);
    }

    const dates = new Map(Object.entries(publishedDates));

    let items = $('.postIndexItem')
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);
            const title = $item.find('.title a').text().trim();
            const link = new URL($item.find('.title a').attr('href')!, currentUrl).href;
            const dateStr = $item.find('.date').text().trim();
            const publishedDate = dates.get(link);
            const pubDate = publishedDate ? parseDate(publishedDate) : dateStr ? timezone(parseDate(dateStr), 0) : undefined;

            return {
                title,
                link,
                pubDate,
            };
        });
    const hasDates = items.every((item) => dates.has(item.link!) && item.pubDate && !Number.isNaN(parseDate(item.pubDate).getTime()));

    items = await pMap(
        items,
        (item) =>
            cache.tryGet(item.link!, async () => {
                try {
                    const detailResponse = await got(item.link);
                    const $detail = load(detailResponse.data);

                    const published = $detail('.post-info time[datetime]').attr('datetime');
                    if (published && !hasDates) {
                        item.pubDate = parseDate(published.replace(/\sUTC$/, ''), 'YYYY-MM-DD HH:mm:ss ZZ');
                    }

                    // Keep every article paragraph and section, excluding page metadata and subscription widgets.
                    item.description = $detail('.post > .paragraph, .post > .sect1')
                        .toArray()
                        .map((element) => $detail.html(element))
                        .join('');

                    return item;
                } catch (error) {
                    logger.error(`处理文章 ${item.link} 时发生错误: ${error}`);
                    return item;
                }
            }),
        { concurrency: 3 }
    );

    return {
        title: 'Enterprise Craftsmanship - Archives',
        link: currentUrl,
        item: items,
    };
}
