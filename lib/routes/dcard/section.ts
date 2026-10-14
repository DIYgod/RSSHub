import type { Route } from '@/types';
import cache from '@/utils/cache';
import { parseDate } from '@/utils/parse-date';
import { getPlaywrightPage } from '@/utils/playwright';

import utils from './utils';

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

    let link = 'https://www.dcard.tw/f';
    let api = 'https://www.dcard.tw/service/api/v2';
    let title = 'Dcard - ';

    if (section !== 'posts' && section !== 'popular' && section !== 'latest') {
        link += `/${section}`;
        api += `/forums/${section}`;
        title += `${section} - `;
    }
    api += '/posts';
    if (type === 'popular') {
        link += '?latest=false';
        api += '?popular=true';
        title += '熱門';
    } else {
        link += '?latest=true';
        api += '?popular=false';
        title += '最新';
    }

    const { page, context, destroy } = await getPlaywrightPage(`${api}&limit=100`, { noGoto: true, closeTimeout: 0 });
    try {
        await page.route('**/*', (route) => {
            const request = route.request();
            request.resourceType() === 'document' || request.resourceType() === 'script' ? route.continue() : route.abort();
        });
        await page.setExtraHTTPHeaders({
            referer: `https://www.dcard.tw/f/${section}`,
        });

        const sourceResponse = await page.goto(`${api}&limit=100`);
        if (sourceResponse && !sourceResponse.ok()) {
            throw new Error(`Dcard returned HTTP ${sourceResponse.status()} for its public posts API. The source may require connection verification.`);
        }
        await page.waitForSelector('body > pre');
        const response = await page.evaluate(() => document.querySelector('body > pre')!.textContent);
        const cookies = await cache.tryGet('dcard:cookies', () => page.context().cookies(), 3600, false);
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
        const result = await utils.ProcessFeed(items, cookies, context, limit, cache);

        return {
            title,
            link,
            description: '不想錯過任何有趣的話題嗎？趕快加入我們吧！',
            item: result,
        };
    } finally {
        await destroy();
    }
}
