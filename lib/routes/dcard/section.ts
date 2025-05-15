import { Route } from '@/types';
import cache from '@/utils/cache';
import { parseDate } from '@/utils/parse-date';
import utils from './utils';
import puppeteer from '@/utils/puppeteer';

export const route: Route = {
    path: '/:section/:type?',
    categories: ['bbs'],
    example: '/dcard/funny/popular',
    parameters: { section: '板塊名稱，URL 中獲得', type: '排序，popular 熱門；latest 最新，默認為 latest' },
    features: {
        requireConfig: false,
        requirePuppeteer: true,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '板塊帖子',
    maintainers: ['HenryQW'],
    handler,
};

async function handler(ctx) {
    const { type = 'latest', section = 'posts' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number(ctx.req.query('limit')) : 30;
    const browser = await puppeteer();

    let link = `https://www.dcard.tw/f`;
    let api = `https://www.dcard.tw/service/api/v2`;
    let title = `Dcard - `;

    if (section !== 'posts' && section !== 'popular' && section !== 'latest') {
        link += `/${section}`;
        api += `/forums/${section}`;
        title += `${section} - `;
    }
    api += `/posts`;
    if (type === 'popular') {
        link += '?latest=false';
        api += '?popular=true';
        title += '熱門';
    } else {
        link += '?latest=true';
        api += '?popular=false';
        title += '最新';
    }

    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', (request) => {
        request.resourceType() === 'document' || request.resourceType() === 'script' ? request.continue() : request.abort();
    });
    await page.setExtraHTTPHeaders({
        referer: `https://www.dcard.tw/f/${section}`,
    });

    await page.goto(`${api}&limit=100`);
    await page.waitForSelector('body > pre');
    const response = await page.evaluate(() => document.querySelector('body > pre').textContent);
    const cookies = await cache.tryGet('dcard:cookies', () => page.cookies(), 3600, false);
    await page.close();

    const data = JSON.parse(response);
    const items = data.map((item) => ({
        title: `「${item.forumName}」${item.title}`,
        link: `https://www.dcard.tw/f/${item.forumAlias}/p/${item.id}`,
        description: item.excerpt,
        author: `${item.school || '匿名'}．${item.gender === 'M' ? '男' : '女'}`,
        pubDate: parseDate(item.createdAt),
        category: [item.forumName, ...item.topics],
        forumAlias: item.forumAlias,
        id: item.id,
    }));

    // parse fulltext for first `limit` items
    const result = await utils.ProcessFeed(items, cookies, browser, limit, cache);
    await browser.close();

    return {
        title,
        link,
        description: '不想錯過任何有趣的話題嗎？趕快加入我們吧！',
        item: result,
    };
}
