import { Route } from '@/types';

import ofetch from '@/utils/ofetch';
import * as cheerio from 'cheerio';
import { art } from '@/utils/render';
import path from 'node:path';
import { config } from '@/config';
import puppeteer from '@/utils/puppeteer';

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
    },
    radar: [
        {
            source: ['missav.ws/dm397/new', 'missav.ws/new', 'missav.ws/'],
        },
        {
            source: ['missav.ai/dm397/new', 'missav.ai/new', 'missav.ai/'],
        },
    ],
    name: '最近更新',
    maintainers: ['TonyRL'],
    handler,
    url: 'missav.ws/dm397/new',
};

async function handler() {
    const baseUrl = 'https://missav.ws';
    const url = `${baseUrl}/dm397/new`;

    // const browser = await puppeteer();
    const browser = await puppeteer({stealth: true});
    const page = await browser.newPage();

    // https://intoli.com/blog/not-possible-to-block-chrome-headless/
    // Pass the User-Agent Test.
    // const userAgent = 'Mozilla/5.0 (X11; Linux x86_64)' +
    //     'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.39 Safari/537.36';
    // await page.setUserAgent(userAgent);

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
                description: art(path.join(__dirname, 'templates/preview.art'), {
                    poster: poster.href,
                    video,
                    type: video.split('.').pop(),
                }),
            };
        });

    return {
        title: $('head title').text(),
        description: $('head meta[name="description"]').attr('content'),
        link: baseUrl,
        item: items,
    };
}
