import { load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';
import pMap from 'p-map';

import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import { getPlaywrightPage, type Page } from '@/utils/playwright';

const rootUrl = 'https://www.baozimh.com';

export const route: Route = {
    path: '/comic/:name',
    categories: ['anime'],
    example: '/baozimh/comic/guowangpaiming-shiricaofu',
    parameters: { name: '漫画名称，在漫画链接可以得到(`comic/` 后的那段)' },
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
            source: ['www.baozimh.com/comic/:name'],
        },
    ],
    name: '订阅漫画',
    maintainers: ['Fatpandac'],
    handler,
};

const allowPageRequests = async (page: Page) => {
    await page.route('**/*', async (request) => {
        await (['document', 'script', 'xhr', 'fetch'].includes(request.request().resourceType()) ? request.continue() : request.abort());
    });
};

async function handler(ctx): Promise<Data> {
    const name = ctx.req.param('name');
    const url = `${rootUrl}/comic/${name}`;

    const { page, context, destroy } = await getPlaywrightPage(url, {
        closeTimeout: 0,
        onBeforeLoad: allowPageRequests,
    });
    try {
        await page.waitForSelector('#chapter-items');
        const html = await page.content();
        const $ = load(html);
        const comicTitle = $('div > div.pure-u-1-1.pure-u-sm-2-3.pure-u-md-3-4 > div > h1').text();
        const list = $('#chapter-items')
            .first()
            .children()
            .toArray()
            .map((item): DataItem => {
                const title = $(item).find('span').text();
                const link = rootUrl + $(item).find('a').attr('href');

                return {
                    title,
                    link,
                };
            });

        // more chapters
        const otherList = $('#chapters_other_list')
            .first()
            .children()
            .toArray()
            .map((item): DataItem => {
                const title = $(item).find('span').text();
                const link = rootUrl + $(item).find('a').attr('href');

                return {
                    title,
                    link,
                };
            });
        const combinedList = [...list, ...otherList].toReversed();

        const items = await pMap(
            combinedList,
            (item) =>
                cache.tryGet(item.link!, async () => {
                    const detailResponse = await context.request.get(item.link!);
                    if (!detailResponse.ok()) {
                        throw new Error(`Unable to fetch comic chapter (${detailResponse.status()}): ${item.link}`);
                    }
                    const html = await detailResponse.text();
                    const $ = load(html);
                    item.description = renderToString(
                        <>
                            {$('.comic-contain')
                                .find('amp-img')
                                .toArray()
                                .map((img) => (
                                    <img src={$(img).attr('src')} />
                                ))}
                        </>
                    );

                    return item;
                }),
            { concurrency: 3 }
        );

        return {
            title: `包子漫画-${comicTitle}`,
            description: $('.comics-detail__desc').text(),
            link: url,
            language: 'zh-TW',
            item: items,
        };
    } finally {
        await destroy();
    }
}
