import { load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';

import { config } from '@/config';
import type { Data, Route } from '@/types';
import cache from '@/utils/cache';
import logger from '@/utils/logger';
import { getPlaywrightPage } from '@/utils/playwright';

const render = ({ preview, cover }) =>
    renderToString(
        <>
            {preview ? (
                <video controls preload="metadata" poster={cover}>
                    <source src={preview} type="video/mp4" />
                </video>
            ) : null}
        </>
    );

const handler = async (): Promise<Data> => {
    const baseUrl = 'https://spankbang.com';
    const link = `${baseUrl}/new_videos/`;

    const data = await cache.tryGet(
        link,
        async () => {
            const { page, destroy } = await getPlaywrightPage(link, {
                noGoto: true,
                closeTimeout: 0,
                javaScriptEnabled: false,
                onBeforeLoad: async (page) => {
                    await page.route('**/*', (route) => {
                        const request = route.request();
                        const hostname = new URL(request.url()).hostname;
                        return request.resourceType() === 'document' && (hostname === 'spankbang.com' || hostname.endsWith('.spankbang.com')) ? route.continue() : route.abort();
                    });
                },
            });
            try {
                logger.http(`Requesting ${link}`);
                await page.goto(link, {
                    waitUntil: 'domcontentloaded',
                    timeout: 30000,
                });

                const response = await page.content();
                const $ = load(response);

                const items = $('.video-item')
                    .toArray()
                    .map((item) => {
                        const $item = $(item);
                        const thumb = $item.find('.thumb');
                        const cover = $item.find('img.cover');

                        return {
                            title: thumb.attr('title')!,
                            link: new URL(thumb.attr('href')!, baseUrl).href,
                            description: render({
                                cover: cover.data('src'),
                                preview: cover.data('preview'),
                            }),
                        };
                    });

                return {
                    title: $('head title').text(),
                    description: $('head meta[name="description"]').attr('content'),
                    item: items,
                };
            } finally {
                await destroy();
            }
        },
        config.cache.routeExpire,
        false
    );

    return {
        title: data.title,
        description: data.description,
        link,
        item: data.item,
    };
};

export const route: Route = {
    path: '/new_videos',
    categories: ['multimedia'],
    example: '/spankbang/new_videos',
    name: 'New Porn Videos',
    maintainers: ['TonyRL'],
    features: {
        antiCrawler: true,
        requirePuppeteer: true,
        nsfw: true,
    },
    radar: [
        {
            source: ['spankbang.com/new_videos/', 'spankbang.com/'],
        },
    ],
    handler,
};
