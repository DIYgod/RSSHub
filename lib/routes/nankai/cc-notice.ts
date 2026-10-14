import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/cc/:type?',
    categories: ['university'],
    example: '/nankai/cc/13291',
    parameters: { type: '栏目编号（若为空则默认为"最新动态"）' },
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
            source: ['cc.nankai.edu.cn', 'cc.nankai.edu.cn/:type/list.htm'],
            target: '/cc/:type?',
        },
    ],
    name: '计算机学院',
    maintainers: ['vicguo0724'],
    description: `| 最新动态 | 学院公告 | 学生工作通知 | 科研信息 | 本科生教学 | 党团园地 | 研究生招生 | 研究生教学 | 境外交流 |
| -------- | -------- | ------------ | -------- | ---------- | -------- | ---------- | ---------- | -------- |
| 13291    | 13292    | 13293        | 13294    | 13295      | 13296    | 13297      | 13298      | 13299    |`,
    url: 'cc.nankai.edu.cn',
    handler: async (ctx) => {
        // Read the notice category from the route path.
        const { type = '13291' } = ctx.req.param();
        const baseUrl = 'https://cc.nankai.edu.cn';
        const { data: response } = await got(`${baseUrl}/${type}/list.htm`);
        const $ = load(response);

        // Read the category name.
        const categoryName = $('.accordion .selected a').text().trim() || '最新动态';

        // Parse the notice list.
        const list = $('#wp_news_w49 table tr')
            .slice(1) // Skip the header row.
            .toArray()
            .map((tr): DataItem | null => {
                const $tr = $(tr);
                const cells = $tr.find('td');

                if (cells.length < 5) {
                    return null;
                }

                const title = cells.eq(1).text();
                const publisher = cells.eq(2).text().trim();
                const dateStr = cells.eq(3).text().trim();

                // Extract the link from the onclick attribute.
                const onclick = $tr.attr('onclick');
                let link = '';
                if (onclick) {
                    const match = onclick.match(/window\.location\.href='([^']+)';/);
                    if (match) {
                        link = new URL(match[1], `${baseUrl}/${type}/list.htm`).href;
                    }
                }

                return {
                    title,
                    link,
                    pubDate: dateStr ? timezone(parseDate(dateStr), 8) : undefined,
                    author: publisher,
                };
            })
            .filter((item): item is DataItem => Boolean(item?.link)); // Discard entries without a link.

        // Fetch the article details.
        const items = await pMap(
            list,
            async (item) => {
                const detail = await cache.tryGet(`nankai:cc:article:v3:${item.link}`, async () => {
                    const { data: response } = await got(item.link);
                    const $ = load(response);
                    const description = $('.wp_articlecontent').html() || $('.body-news-detail').html();
                    if (!description) {
                        throw new Error(`Could not find the computing notice content: ${item.link}`);
                    }
                    return { description };
                });
                return { ...item, ...detail };
            },
            { concurrency: 3 }
        );

        return {
            // Feed title.
            title: `南开大学计算机学院-${categoryName}`,
            // Feed link.
            link: `${baseUrl}/${type}/list.htm`,
            // Feed items.
            item: items,
        };
    },
};
