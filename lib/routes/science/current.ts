// @ts-nocheck
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
const { baseUrl, fetchDesc, getItem } = require('./utils');
import puppeteer from '@/utils/puppeteer';

export default async (ctx) => {
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

    ctx.set('data', {
        title: `${pageTitleName} | Current Issue`,
        description: `Current Issue of ${pageTitleName}`,
        image: `${baseUrl}/apple-touch-icon.png`,
        link: pageURL,
        language: 'en-US',
        item: items,
    });
};
