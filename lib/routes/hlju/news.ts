import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDateInTimezone } from '@/utils/parse-date-in-timezone';
import { getRouteLimit } from '@/utils/route-limit';

export const route: Route = {
    path: '/news/:category?',
    categories: ['university'],
    example: '/hlju/news/hdyw',
    parameters: {
        category: {
            description: '新闻分类，默认为黑大要闻',
            options: [
                { value: 'hdyw', label: '黑大要闻' },
                { value: 'jjxy', label: '菁菁校园' },
                { value: 'rwfc', label: '人物风采' },
                { value: 'xwdt', label: '新闻动态' },
                { value: 'jxky', label: '教学科研' },
                { value: 'xyjw', label: '学院经纬' },
                { value: 'jlhz', label: '交流合作' },
                { value: 'cxcy', label: '创新创业' },
            ],
        },
    },
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
            source: ['hdxw.hlju.edu.cn/'],
            target: '/news',
        },
        {
            source: ['hdxw.hlju.edu.cn/hdyw.htm'],
            target: '/news/hdyw',
        },
        {
            source: ['hdxw.hlju.edu.cn/jjxy.htm'],
            target: '/news/jjxy',
        },
        {
            source: ['hdxw.hlju.edu.cn/rwfc.htm'],
            target: '/news/rwfc',
        },
        {
            source: ['hdxw.hlju.edu.cn/xwdt.htm'],
            target: '/news/xwdt',
        },
        {
            source: ['hdxw.hlju.edu.cn/jxky.htm'],
            target: '/news/jxky',
        },
        {
            source: ['hdxw.hlju.edu.cn/xyjw.htm'],
            target: '/news/xyjw',
        },
        {
            source: ['hdxw.hlju.edu.cn/jlhz.htm'],
            target: '/news/jlhz',
        },
        {
            source: ['hdxw.hlju.edu.cn/cxcy.htm'],
            target: '/news/cxcy',
        },
    ],
    name: '新闻网',
    maintainers: ['LCMs-YoRHa'],
    handler,
};

async function handler(ctx) {
    const category = ctx.req.param('category') ?? 'hdyw';
    const baseUrl = 'https://hdxw.hlju.edu.cn';
    const listUrl = `${baseUrl}/${category}.htm`;

    const response = await ofetch(listUrl);
    const $ = load(response);

    // Read the category name from the listing.
    const categoryName = $('.bgtitle_list').text().trim() || '黑大要闻';

    // Extract the first page of article links.
    const list = $('a[href*="info/"]')
        .toArray()
        .map((element) => {
            const item = $(element);
            const link = item.attr('href');
            const title = item.text();

            if (!title.trim() || !link) {
                return null;
            }

            // Read the publication date from the same table row.
            const row = item.closest('tr');
            const parent = row.length ? row : item.parent();
            const dateMatch = parent.text().match(/(\d{4})[年/-](\d{1,2})[月/-](\d{1,2})日?/);

            return {
                title,
                link: new URL(link, listUrl).href,
                pubDate: dateMatch ? parseDateInTimezone(`${dateMatch[1]}-${dateMatch[2].padStart(2, '0')}-${dateMatch[3].padStart(2, '0')}`, 8) : undefined,
            } satisfies DataItem;
        })
        .filter((item): item is NonNullable<typeof item> => item !== null);

    const limit = getRouteLimit(ctx, 15);
    const candidateLimit = ctx.req.query('sorted') === 'false' ? limit : Math.max(15, limit);
    const uniqueList = list.filter((item, index, arr) => arr.findIndex((i) => i.link === item.link) === index).slice(0, candidateLimit);

    const items = await pMap(
        uniqueList,
        async (item) => {
            if (new URL(item.link).hostname !== new URL(baseUrl).hostname) {
                return item;
            }

            const details = await cache.tryGet(`hlju:article-details:${item.link}`, async () => {
                const detailResponse = await ofetch(item.link);
                const $detail = load(detailResponse);
                const content = $detail('.v_news_content');
                content.find('style, .print, .share').remove();
                const description = content.html();
                if (!description?.trim()) {
                    throw new Error(`The Heilongjiang University article has no main content: ${item.link}`);
                }

                const timeMatch = $detail('.timestyle110144')
                    .text()
                    .match(/(\d{4}[-/]\d{2}[-/]\d{2})\s*(\d{2}:\d{2}(?::\d{2})?)/);
                const pubDate = timeMatch ? parseDateInTimezone(`${timeMatch[1].replaceAll('/', '-')} ${timeMatch[2]}`, 8) : undefined;
                return {
                    description,
                    ...(pubDate && !Number.isNaN(pubDate.getTime()) && { pubDate }),
                };
            });

            return { ...item, ...details };
        },
        { concurrency: 3 }
    );

    return {
        title: `黑龙江大学新闻网 - ${categoryName}`,
        link: listUrl,
        description: `黑龙江大学新闻网${categoryName}栏目`,
        item: items,
    };
}
