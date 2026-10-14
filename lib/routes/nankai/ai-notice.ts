import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/ai/:type?',
    categories: ['university'],
    example: '/nankai/ai/zxdt',
    parameters: { type: '栏目类型（若为空则默认为"最新动态"）' },
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
            source: ['ai.nankai.edu.cn', 'ai.nankai.edu.cn/xwzx/:type.htm'],
            target: '/ai/:type?',
        },
    ],
    name: '人工智能学院',
    maintainers: ['LMark'],
    description: `| 最新动态 | 学院公告 | 学生之窗 | 科研信息 | 本科生教学 | 党团园地 | 研究生招生 | 研究生教学 | 就业信息 | 国际交流 |
| -------- | -------- | -------- | -------- | ---------- | -------- | ---------- | ---------- | -------- | -------- |
| zxdt     | xygg     | xszc     | kyxx     | bksjx      | dtyd     | yjszs      | yjsjx      | jyxx     | gjjl     |`,
    url: 'ai.nankai.edu.cn',
    handler: async (ctx) => {
        // Read the notice category from the route path.
        const { type = 'zxdt' } = ctx.req.param();
        const baseUrl = 'https://ai.nankai.edu.cn';
        const { data: response } = await got(`${baseUrl}/xwzx/${type}.htm`);
        const $ = load(response);

        // Map the category identifier to its name.
        const categoryMap = {
            zxdt: '最新动态',
            xygg: '学院公告',
            xszc: '学生之窗',
            kyxx: '科研信息',
            bksjx: '本科生教学',
            dtyd: '党团园地',
            yjszs: '研究生招生',
            yjsjx: '研究生教学',
            jyxx: '就业信息',
            gjjl: '国际交流',
        };

        const categoryName = categoryMap[type] || '最新动态';

        // Parse the notice list.
        const list = $('.gage-list-news table tr')
            .toArray()
            .map((tr): DataItem | null => {
                const $tr = $(tr);
                const cells = $tr.find('td');

                if (cells.length < 3) {
                    return null;
                }

                const titleCell = cells.eq(0);
                const sourceCell = cells.eq(1);
                const dateCell = cells.eq(2);

                // Extract the title and link.
                const $titleLink = titleCell.find('a');
                const title = $titleLink.attr('title') || $titleLink.text();
                const href = $titleLink.attr('href');
                const link = href ? new URL(href, `${baseUrl}/xwzx/${type}.htm`).href : undefined;

                // Extract the publication date.
                const dateStr = dateCell.text().trim();
                const pubDate = dateStr ? (dateStr.includes('/') ? timezone(parseDate(dateStr, 'YYYY/MM/DD'), 8) : timezone(parseDate(dateStr), 8)) : undefined;

                // Extract the publisher.
                const source = sourceCell.text();

                return {
                    title,
                    link,
                    pubDate,
                    author: source || '人工智能学院',
                    description: '', // Initialize the description.
                };
            })
            .filter((item): item is DataItem => Boolean(item?.link && item.title)); // Discard entries without a link.

        // Fetch the article details.
        const items = await pMap(
            list,
            async (item) => {
                const detail = await cache.tryGet(`nankai:ai:article:v3:${item.link}`, async () => {
                    const { data: response } = await got(item.link);
                    const $ = load(response);

                    const $description = $('.v_news_content').length ? $('.v_news_content') : $('#txt');
                    if (!$description.length) {
                        throw new Error(`Could not find the AI notice content: ${item.link}`);
                    }
                    return { description: $description.html() };
                });
                return { ...item, ...detail };
            },
            { concurrency: 3 }
        );

        return {
            // Feed title.
            title: `南开大学人工智能学院-${categoryName}`,
            // Feed link.
            link: `${baseUrl}/xwzx/${type}.htm`,
            // Feed items.
            item: items,
        };
    },
};
