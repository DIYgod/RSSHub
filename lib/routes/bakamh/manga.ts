import { load } from 'cheerio';
import { FetchError } from 'ofetch';
import pMap from 'p-map';

import CaptchaError from '@/errors/types/captcha';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getPlaywrightPage } from '@/utils/playwright';
import { getRouteLimit } from '@/utils/route-limit';

const url = 'https://bakamh.com';

async function getChapterHtml(context: Awaited<ReturnType<typeof getPlaywrightPage>>['context'], link: string) {
    const page = await context.newPage();
    try {
        const response = await page.goto(link, { waitUntil: 'domcontentloaded', timeout: 15000 });
        if (!response?.ok()) {
            throw new CaptchaError('The chapter is currently unavailable to anonymous browser requests.');
        }
        return await page.content();
    } finally {
        await page.close();
    }
}

const handler = async (ctx) => {
    const { name } = ctx.req.param();
    const limit = getRouteLimit(ctx, 15);

    const link = `${url}/manga/${name}/`;
    let instance: Awaited<ReturnType<typeof getPlaywrightPage>> | undefined;
    try {
        let response;
        try {
            response = await ofetch(link);
        } catch (error) {
            if (!(error instanceof FetchError) || (error.status !== 403 && error.status !== 429)) {
                throw error;
            }
            instance = await getPlaywrightPage(link, {
                closeTimeout: 0,
                onBeforeLoad: async (_page, context) => {
                    await context!.route('**/*', (route) => (['document', 'script', 'xhr', 'fetch', 'stylesheet'].includes(route.request().resourceType()) ? route.continue() : route.abort()));
                },
            });
            await instance.page.waitForSelector('.listing-chapters_main li a[href]', { timeout: 15000 });
            response = await instance.page.content();
        }
        const $ = load(response);
        const list = $('.listing-chapters_main li')
            .toArray()
            .slice(0, limit)
            .map((item): DataItem => {
                const $item = $(item);
                const itemDate = $item.find('i').text().replaceAll(' ', '');

                return {
                    title: $item.find('a').text(),
                    link: $item.find('a').attr('href'),
                    guid: $item.find('a').attr('href'),
                    pubDate: itemDate ? parseDate(itemDate, 'YYYY年M月D日') : undefined,
                };
            });

        const items = await pMap(
            list,
            async (item) => {
                try {
                    return await cache.tryGet(item.link!, async () => {
                        const response = instance ? await getChapterHtml(instance.context, item.link!) : await ofetch(item.link!);
                        const $ = load(response);
                        const comicpage = $('div.reading-content img');
                        if (!comicpage.length) {
                            throw new CaptchaError('The source did not provide public chapter images.');
                        }
                        const containerDiv = $('<div class="image-container"></div>');
                        comicpage.appendTo(containerDiv);
                        item.description = containerDiv.html();
                        return item;
                    });
                } catch (error) {
                    if (error instanceof CaptchaError || error instanceof FetchError || (error instanceof Error && (error.name === 'TimeoutError' || error.message.startsWith('page.goto:')))) {
                        return item;
                    }
                    throw error;
                }
            },
            { concurrency: 3, stopOnError: false }
        );

        return {
            title: $('title').text(),
            link,
            description: $('.post-content_item p').text(),
            image: $('.summary_image a img').attr('src'),
            item: items,
        };
    } finally {
        await instance?.destroy();
    }
};

export const route: Route = {
    path: '/manga/:name',
    categories: ['anime'],
    example: '/bakamh/manga/最强家丁',
    parameters: { name: '漫画名称，漫画主页的地址栏中' },
    radar: [
        {
            source: ['bakamh.com/manga/:name/'],
        },
    ],
    name: '漫画更新',
    features: {
        requirePuppeteer: true,
        antiCrawler: true,
    },
    maintainers: ['yoyobase'],
    handler,
    url: 'bakamh.com',
};
