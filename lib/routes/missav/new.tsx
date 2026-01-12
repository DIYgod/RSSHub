// import ofetch from '@/utils/ofetch';
import * as cheerio from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
// import { config } from '@/config';
import puppeteer from '@/utils/puppeteer';

const urlPath = 'dm514/new';

export const route: Route = {
    path: '/new',
    categories: ['multimedia'],
    example: '/missav/new',
    features: {
        requireConfig: false,
        requirePuppeteer: true,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        nsfw: true,
    },
    radar: [
        {
            source: [`missav.ws/${urlPath}`, 'missav.ws/new', 'missav.ws/'],
        },
        {
            source: [`missav.ai/${urlPath}`, 'missav.ai/new', 'missav.ai/'],
        },
    ],
    name: '最近更新',
    maintainers: ['TonyRL'],
    handler,
    url: 'missav.ws/dm397/new',
};

async function handler() {
    const baseUrl = 'https://missav.ws';
    const url = `${baseUrl}/${urlPath}`;

    const browser = await puppeteer();
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', (request) => {
        request.resourceType() === 'document' || request.resourceType() === 'script' || request.resourceType() === 'xhr' ? request.continue() : request.abort();
    });
    await page.goto(url, {
        waitUntil: 'domcontentloaded',
    });
    const response = await page.evaluate(() => document.documentElement.innerHTML);
    await browser.close();

    // const response = await ofetch(`${baseUrl}/dm397/new`, {
    //     headers: {
    //         'User-Agent': config.trueUA,
    //     },
    // });

    const $ = cheerio.load(response);

    const items = $('.grid .group')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const title = $item.find('.text-secondary');
            const poster = new URL($item.find('img').data('src'));
            poster.searchParams.set('class', 'normal');
            const video = $item.find('video').data('src');
            return {
                title: title.text().trim(),
                link: title.attr('href'),
                description: renderToString(
                    <video controls preload="metadata" poster={poster.href}>
                        <source src={video} type={video.split('.').pop()} />
                    </video>
                ),
            };
        });

    return {
        title: $('head title').text(),
        description: $('head meta[name="description"]').attr('content'),
        link: baseUrl,
        item: items,
    };
}
