import { Route, Data, DataItem } from '@/types';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import cache from '@/utils/cache';
import puppeteer from '@/utils/puppeteer';
import logger from '@/utils/logger';

export const route: Route = {
    path: '/top-category/:categoryID/:period?',
    categories: ['bbs'],
    example: '/uscardforum/top-category/33/daily',
    parameters: {
        categoryID: '美卡论坛分类 ID，例如 33 是 Jobs',
        period: '时间范围，可选: daily（今日）、weekly（本周，默认）、monthly（本月）、yearly（本年）',
    },
    features: {
        requireConfig: false,
        requirePuppeteer: true,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['uscardforum.com/c/:categoryID/l/top', 'uscardforum.com/c/:categoryID/l/top?period=:period'],
            target: '/top-category/:categoryID/:period?',
        },
    ],
    name: '分类热门帖子',
    maintainers: ['xiaojiou176'],
    handler,
};

async function handler(ctx): Promise<Data> {
    const { categoryID, period = 'weekly' } = ctx.req.param();
    const baseUrl = 'https://www.uscardforum.com';
    const url = `${baseUrl}/c/${categoryID}/l/top?period=${period}`;

    const browser = await puppeteer();
    const page = await browser.newPage();

    // 拦截非必须资源，加快加载速度
    await page.setRequestInterception(true);
    page.on('request', (request) => {
        const type = request.resourceType();
        if (['document', 'script', 'xhr'].includes(type)) {
            request.continue();
        } else {
            request.abort();
        }
    });

    try {
        logger.http(`Requesting ${url}`);
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await new Promise((resolve) => setTimeout(resolve, 3000));

        const content = await page.content();
        const $ = load(content);
        await page.close();

        const categoryName =
            $('.category-name').text().trim() ||
            $('h1')
                .text()
                .trim()
                .replace(/热门帖子/, '') ||
            `分类 ${categoryID}`;

        const list: DataItem[] = [];
        $('.topic-list tbody tr').each((_, el) => {
            const title = $(el).find('a.title').text().trim();
            const href = $(el).find('a.title').attr('href');

            if (!href) {
                return;
            }

            const link = baseUrl + href;
            const author = $(el).find('.posters .poster img').attr('title') || 'Unknown';
            const replies = $(el).find('td.num.posts').text().trim();
            const views = $(el).find('td.num.views').text().trim();
            const pubDate = $(el).find('td.num.activity time').attr('datetime');

            list.push({
                title: `[${author}] ${title}`,
                link,
                description: `Replies: ${replies} · Views: ${views}`,
                author,
                pubDate: pubDate ? parseDate(pubDate) : undefined,
                guid: link,
            });
        });

        const items = await Promise.all(
            list.map((item) =>
                cache.tryGet(item.link as string, async () => {
                    try {
                        const postPage = await browser.newPage();
                        await postPage.setRequestInterception(true);
                        postPage.on('request', (req) => {
                            const type = req.resourceType();
                            if (['document', 'script', 'xhr'].includes(type)) {
                                req.continue();
                            } else {
                                req.abort();
                            }
                        });

                        logger.http(`Requesting ${item.link}`);
                        await postPage.goto(item.link as string, { waitUntil: 'domcontentloaded', timeout: 60000 });
                        await new Promise((resolve) => setTimeout(resolve, 2000));

                        const postContent = await postPage.content();
                        const post$ = load(postContent);
                        await postPage.close();

                        const content = post$('.topic-body .cooked').first().html();
                        const originalDescription = item.description;

                        if (content) {
                            item.description = `
                                <p>${originalDescription}</p>
                                <hr />
                                ${content}
                            `;
                        }

                        return item;
                    } catch (error) {
                        logger.error(`Error fetching post content for ${item.link}: ${error}`);
                        return item;
                    }
                })
            )
        ).then((items) => items.filter(Boolean) as DataItem[]);

        return {
            title: `美卡论坛 - ${categoryName} 热门帖子（${period}）`,
            link: url,
            item: items,
        };
    } finally {
        await browser.close();
    }
}
