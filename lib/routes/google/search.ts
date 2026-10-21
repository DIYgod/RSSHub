import { load } from 'cheerio';
import pMap from 'p-map';

import { config } from '@/config';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { getPlaywrightPage } from '@/utils/playwright';

export const route: Route = {
    path: '/search/:keyword/:language?',
    categories: ['other'],
    example: '/google/search/rss/zh-CN,zh',
    parameters: { keyword: 'Keyword', language: 'Accept-Language. Example: `zh-CN,zh;q=0.9,en;q=0.8,ja;q=0.7`' },
    features: {
        requireConfig: false,
        requirePuppeteer: true,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Search',
    maintainers: ['CaoMeiYouRen'],
    handler,
};

async function handler(ctx) {
    const { keyword, language = 'en' } = ctx.req.param();
    const searchParams = new URLSearchParams({
        q: keyword,
    });
    const tempUrl = new URL('https://www.google.com/search');
    tempUrl.search = searchParams.toString();
    const url = tempUrl.href;
    const key = `google:search:browser:${language}:${url}`;
    const items = await cache.tryGet(
        key,
        async () => {
            const { page, destroy } = await getPlaywrightPage(url, {
                noGoto: true,
                closeTimeout: 0,
                onBeforeLoad: async (page) => {
                    await page.setExtraHTTPHeaders({ 'Accept-Language': language });
                    await page.route('**/*', async (route) => {
                        await (['document', 'script', 'xhr', 'fetch', 'stylesheet'].includes(route.request().resourceType()) ? route.continue() : route.abort());
                    });
                },
            });
            try {
                await page.goto(url, { waitUntil: 'domcontentloaded' });
                await page.waitForSelector('#search a:has(h3)', { state: 'attached' });
                const response = await page.content();
                const $ = load(response);
                const results = $('#search a:has(h3)')
                    .toArray()
                    .map((el) => {
                        const element = $(el);
                        const result = element.closest('.MjjYud');
                        return {
                            link: new URL(element.attr('href')!, url).href,
                            title: element.find('h3').text(),
                            description: result.find('.VwiC3b').first().html() ?? undefined,
                            author: element.find('.VuuXrf').first().text(),
                        };
                    });
                return await pMap(results, async (item) => ({ ...item, link: await resolveResultUrl(item.link) }), { concurrency: 3 });
            } finally {
                await destroy();
            }
        },
        config.cache.routeExpire,
        false
    );

    return {
        title: `${keyword} - Google Search`,
        description: `${keyword} - Google Search`,
        link: url,
        item: items,
    };
}

async function resolveResultUrl(link: string): Promise<string> {
    const url = new URL(link);
    if (url.hostname !== 'www.google.com' || !['/goto', '/url'].includes(url.pathname)) {
        return link;
    }
    const target = url.searchParams.get('q') ?? url.searchParams.get('url');
    if (target?.startsWith('https://') || target?.startsWith('http://')) {
        return target;
    }
    const response = await ofetch.raw(link, { redirect: 'manual', responseType: 'text' });
    const location = response.headers.get('location');
    if (!location || (!location.startsWith('https://') && !location.startsWith('http://'))) {
        throw new Error('Google Search did not provide a destination URL for a search result. Try again after the anonymous access restriction clears.');
    }
    return location;
}
