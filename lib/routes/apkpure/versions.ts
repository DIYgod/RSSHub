import { load } from 'cheerio';

import type { Route } from '@/types';
import logger from '@/utils/logger';
import { parseDate } from '@/utils/parse-date';
import puppeteer from '@/utils/puppeteer';

export const route: Route = {
    path: '/versions/:pkg/:region?',
    categories: ['program-update'],
    example: '/apkpure/versions/jp.co.craftegg.band/jp',
    parameters: { pkg: 'Package name', region: 'Region code, `en` by default' },
    features: {
        requireConfig: false,
        requirePuppeteer: true,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Versions',
    maintainers: ['maple3142'],
    handler,
};

async function handler(ctx) {
    const { pkg, region = 'en' } = ctx.req.param();
    const baseUrl = 'https://apkpure.com';
    const link = `${baseUrl}/${region}/${pkg}/versions`;

    const browser = await puppeteer();
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', (request) => {
        request.resourceType() === 'document' ? request.continue() : request.abort();
    });
    logger.http(`Requesting ${link}`);
    await page.goto(link, {
        waitUntil: 'domcontentloaded',
    });

    const r = await page.evaluate(() => document.documentElement.innerHTML);
    await browser.close();

    const $ = load(r);
    const img = new URL($('.ver-top img').attr('src'));
    img.searchParams.delete('w'); // get full resolution icon

    const items = $('.ver li')
        .toArray()
        .map((ver) => {
            ver = $(ver);
            return {
                title: ver.find('.ver-item-n').text(),
                description: ver.html(),
                link: `${baseUrl}${ver.find('a').attr('href')}`,
                pubDate: parseDate(ver.find('.update-on').text().replaceAll(/年|月/g, '-').replace('日', '')),
            };
        });

    return {
        title: $('.ver-top-h1').text(),
        description: $('.ver-top-title p').text(),
        image: img.href,
        language: region ?? 'en',
        link,
        item: items,
    };
}
