import { load } from 'cheerio';

import { config } from '@/config';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import logger from '@/utils/logger';
import { parseDate } from '@/utils/parse-date';
import playwright from '@/utils/playwright';

// /iqiyi/user/video/:uid
// http://localhost:1200/iqiyi/user/video/2289191062
export const route: Route = {
    path: '/user/video/:uid',
    categories: ['multimedia'],
    example: '/iqiyi/user/video/2289191062',
    parameters: { uid: '用户名' },
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
            source: ['iqiyi.com/u/:uid/*'],
        },
    ],
    name: '用户视频',
    maintainers: ['talengu', 'JimenezLi'],
    handler,
};

async function handler(ctx) {
    const uid = ctx.req.param('uid');
    const link = `https://www.iqiyi.com/u/${uid}/videos`;

    const data = await cache.tryGet(
        link,
        async () => {
            const context = await playwright();
            try {
                const page = await context.newPage();
                await page.route('**/*', (route) => {
                    const request = route.request();
                    request.resourceType() === 'document' || request.resourceType() === 'script' ? route.continue() : route.abort();
                });
                logger.http(`Requesting ${link}`);
                await page.goto(link, {
                    waitUntil: 'domcontentloaded',
                });
                await page.waitForSelector('li.pic-txt-li');
                const html = await page.content();

                const $ = load(html);
                const list = $('li.pic-txt-li');

                return {
                    title: $('title').text(),
                    link,
                    item: list.toArray().map((item) => ({
                        title: $(item).attr('title')!,
                        // description: `<img src="${$(item).find('.li-pic img').attr('src')}">`,
                        pubDate: parseDate($(item).find('.li-sub span.sub-date').text(), 'YYYY-MM-DD'),
                        link: $(item).find('.li-dec a').attr('href'),
                    })),
                };
            } finally {
                await context.close();
            }
        },
        config.cache.routeExpire,
        false
    );
    return data;
}
