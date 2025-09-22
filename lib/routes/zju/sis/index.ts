import { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

const base = 'http://www.sis.zju.edu.cn/sischinese/';

/**
 * Map of category types to their corresponding IDs and titles
 * Used to generate URLs and titles for different news categories
 */
const categoryMap = new Map([
    [0, { id: '12614/list.htm', title: '浙江大学外国语学院-重要公告' }],
    [1, { id: '12616/list.htm', title: '浙江大学外国语学院-最新通知' }],
    [2, { id: '12617/list.htm', title: '浙江大学外国语学院-教育教学' }],
    [3, { id: '12618/list.htm', title: '浙江大学外国语学院-科学研究' }],
    [4, { id: '12619/list.htm', title: '浙江大学外国语学院-新闻动态' }],
    [5, { id: '12620/list.htm', title: '浙江大学外国语学院-联系我们' }],
    [6, { id: '12554/list.htm', title: '浙江大学外国语学院-党政管理' }],
    [7, { id: '12563/list.htm', title: '浙江大学外国语学院-组织人事' }],
    [8, { id: '12572/list.htm', title: '浙江大学外国语学院-科学研究' }],
    [9, { id: '12577/list.htm', title: '浙江大学外国语学院-本科教育' }],
    [10, { id: '12541/list.htm', title: '浙江大学外国语学院-研究生教育' }],
    [11, { id: '12542/list.htm', title: '浙江大学外国语学院-学生思政' }],
    [12, { id: 'xyll/list.htm', title: '浙江大学外国语学院-校友联络' }],
    [13, { id: '12609/list.htm', title: '浙江大学外国语学院-对外交流' }],
]);

/**
 * Fetches and parses news items from a specific category page
 * @param categoryId - The category ID to fetch news from
 * @returns Promise<DataItem[]> - Array of news items with basic information
 */
async function fetchNewsItemsByCategory(categoryId: string): Promise<DataItem[]> {
    const response = await got({
        method: 'get',
        url: `${base}${categoryId}`,
    });

    const $ = load(response.data);
    const newsItems = $('.news_list').find('li');

    return newsItems.toArray().map((item) => {
        const element = $(item);
        const href = element.find('a').attr('href');
        let title = element.find('a').attr('title');
        if (!title) {
            // If the title is not found, try to extract it from the link text
            title = element.find('a').text().trim();
        }

        return {
            title,
            pubDate: parseDate(element.find('.news_meta').text()),
            link: href ? new URL(href, base).href : undefined,
        };
    });
}

/**
 * Enriches a news item with detailed content by fetching its full page
 * @param item - The basic news item to enrich
 * @param refererUrl - The referer URL to use when fetching the item details
 * @returns Promise<DataItem> - The enriched news item with description, author, and full title
 */
async function enrichNewsItemWithDetails(item: DataItem, refererUrl: string): Promise<DataItem> {
    // If the item doesn't have a link, return the item as-is
    if (!item.link) {
        return item;
    }

    return await cache.tryGet(item.link, async () => {
        try {
            // Some news items may link to pages that require ZJU private network access
            // or university account authentication. We'll handle these gracefully.
            const response = await got({
                method: 'get',
                url: item.link,
                headers: {
                    Referer: refererUrl,
                },
            });

            const $ = load(response.data);

            // Extract and set the full article content as description
            const description = $('.wp_articlecontent').html();
            if (description) {
                item.description = description;
            }

            // Extract and clean the author information
            let author = $('.arti_metas').find('.arti_publisher').text();
            // Remove the '发布者：' (Publisher:) prefix and trim whitespace
            author = author.replace('发布者：', '').trim();
            if (author) {
                item.author = author;
            }

            return item;
        } catch {
            // If there's an error accessing the page (network issues, authentication required, etc.),
            // return the item with only the basic information we already have
            return item;
        }
    });
}

export const route: Route = {
    path: '/sis/:type',
    categories: ['university'],
    example: '/zju/sis/0',
    parameters: { type: '分类，见下表' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '外国语学院',
    description: `| 重要公告 | 最新通知 | 教育教学 | 科学研究 | 新闻动态 | 联系我们 | 党政管理 | 组织人事 | 科学研究 | 本科教育 | 研究生教育 | 学生思政 | 校友联络 | 对外交流 |
| -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- |
| 0        | 1        | 2        | 3        | 4        | 5        | 6        | 7            | 8            | 9       | 10       | 11       | 12       | 13       |
`,
    maintainers: ['Alex222222222222'],
    handler: handleSisRequest,
    url: 'www.sis.zju.edu.cn',
};

/**
 * Main handler function for processing SIS (School of International Studies) news requests
 * @param ctx - The request context containing route parameters
 * @returns Promise with RSS feed data including title, link, and news items
 */
async function handleSisRequest(ctx: { req: { param: (arg0: string) => string } }) {
    const requestedType = Number.parseInt(ctx.req.param('type'));
    const categoryInfo = categoryMap.get(requestedType);

    // Validate the requested category type
    if (!categoryInfo) {
        const validTypes = [...categoryMap.keys()].join(', ');
        throw new Error(`Invalid type: ${requestedType}. Valid types are: ${validTypes}`);
    }

    const categoryUrl = `${base}${categoryInfo.id}`;

    // Fetch news items from all relevant categories
    const allNewsItems = await fetchNewsItemsByCategory(categoryInfo.id);

    // Enrich each news item with detailed content
    const enrichedItems = await Promise.all(allNewsItems.map((item) => enrichNewsItemWithDetails(item, categoryUrl)));

    return {
        title: categoryInfo.title,
        link: categoryUrl,
        item: enrichedItems,
    };
}
