import { Data, Route } from '@/types';

import puppeteer from '@/utils/puppeteer';
import * as cheerio from 'cheerio';
import { art } from '@/utils/render';
import path from 'node:path';
import { config } from '@/config';
import logger from '@/utils/logger';
import cache from '@/utils/cache';

const render = (data) => art(path.join(__dirname, 'templates/video.art'), data);

const handler = async () => {
    const baseUrl = 'https://spankbang.com';
    const link = `${baseUrl}/new_videos/`;

    const browser = await puppeteer();

    const data = await cache.tryGet(
        link,
        async () => {
            const page = await browser.newPage();
            await page.setRequestInterception(true);
            page.on('request', (request) => {
                request.resourceType() === 'document' ? request.continue() : request.abort();
            });
            logger.http(`Requesting ${link}`);
            await page.goto(link, {
                waitUntil: 'domcontentloaded',
            });

            const response = await page.content();
            const $ = cheerio.load(response);

            const items = $('.video-item')
                .toArray()
                .map((item) => {
                    const $item = $(item);
                    const thumb = $item.find('.thumb');
                    const cover = $item.find('img.cover');

                    return {
                        title: thumb.attr('title'),
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
        },
        config.cache.routeExpire,
        false
    );

    await browser.close();

    return {
        title: data.title,
        description: data.description,
        link,
        item: data.item,
    } as unknown as Promise<Data>;
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
