import cache from '@/utils/cache';
import { load } from 'cheerio';
import got from '@/utils/got';
import puppeteer from '@/utils/puppeteer';

import { baseUrl, fetchDesc, getItem } from './utils';

export default async (ctx) => {
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

    ctx.set('data', {
        title: $('head title').text(),
        description: $('.body02').text().trim(),
        image: `${baseUrl}/apple-touch-icon.png`,
        link: pageUrl,
        language: 'en-US',
        item: items,
    });
};
