import { Route } from '@/types';
import cache from '@/utils/cache';
import { load } from 'cheerio';
import got from '@/utils/got';
import puppeteer from '@/utils/puppeteer';

import { baseUrl, fetchDesc, getItem } from './utils';

export const route: Route = {
    path: '/early/:journal?',
    categories: ['journal'],
    example: '/science/early',
    parameters: { journal: 'Short name for a journal' },
    features: {
        requireConfig: false,
        requirePuppeteer: true,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: true,
    },
    radar: [
        {
            source: ['science.org/journal/:journal', 'science.org/toc/:journal/0/0'],
            target: '/early/:journal',
        },
    ],
    name: 'First Release',
    maintainers: ['y9c', 'TonyRL'],
    handler,
    description: `*only Science, Science Immunology and Science Translational Medicine have first release*`,
};

async function handler(ctx) {
    const { journal = 'science' } = ctx.req.param();
    const pageUrl = `${baseUrl}/toc/${journal}/0/0`;

    const { data: res } = await got(pageUrl, {
        headers: {
            cookie: 'cookiePolicy=iaccept;',
        },
    });
    const $ = load(res);

    const list = $('.card-content .card-header')
        .toArray()
        .map((item) => getItem(item, $));

    const browser = await puppeteer();
    const items = await fetchDesc(list, browser, cache.tryGet);
    await browser.close();

    return {
        title: $('head title').text(),
        description: $('.body02').text().trim(),
        image: `${baseUrl}/apple-touch-icon.png`,
        link: pageUrl,
        language: 'en-US',
        item: items,
    };
}
