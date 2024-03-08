import { Route } from '@/types';
import cache from '@/utils/cache';
// journals form AAAS publishing group
//
// science:        Science
// sciadv:         Science Advances
// sciimmunol:     Science Immunology
// scirobotics:    Science Robotics
// signaling:      Science Signaling
// stm:            Science Translational Medicine

import { load } from 'cheerio';
import got from '@/utils/got';
import { baseUrl, fetchDesc, getItem } from './utils';
import puppeteer from '@/utils/puppeteer';

export const route: Route = {
    path: '/current/:journal?',
    categories: ['finance'],
    example: '/science/current/science',
    parameters: { journal: 'Short name for a journal' },
    features: {
        requireConfig: false,
        requirePuppeteer: true,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: true,
    },
    radar: {
        source: ['science.org/journal/:journal', 'science.org/toc/:journal/current'],
        target: '/current/:journal',
    },
    name: 'Current Issue',
    maintainers: ['y9c', 'TonyRL'],
    handler,
};

async function handler(ctx) {
    const { journal = 'science' } = ctx.req.param();
    const pageURL = `${baseUrl}/toc/${journal}/current`;

    const { data: pageResponse } = await got(pageURL, {
        headers: {
            cookie: 'cookiePolicy=iaccept;',
        },
    });
    const $ = load(pageResponse);
    const pageTitleName = $('head > title').text();

    const list = $('.toc__section .card')
        .toArray()
        .map((item) => getItem(item, $));

    const browser = await puppeteer();
    const items = await fetchDesc(list, browser, cache.tryGet);
    await browser.close();

    return {
        title: `${pageTitleName} | Current Issue`,
        description: `Current Issue of ${pageTitleName}`,
        image: `${baseUrl}/apple-touch-icon.png`,
        link: pageURL,
        language: 'en-US',
        item: items,
    };
}
