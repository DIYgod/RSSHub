// @ts-nocheck
const { baseUrl, parsePage } = require('./utils');
import puppeteer from '@/utils/puppeteer';

export default async (ctx) => {
    const browser = await puppeteer();

    const { $, items } = await parsePage('today', browser, ctx);

    await browser.close();

    ctx.set('data', {
        title: $('head title').text(),
        description: $('meta[name=description]').attr('content'),
        link: `${baseUrl}/today`,
        image: `${baseUrl}/assets_new/img/fbshare.jpg`,
        language: $('meta[property="og:locale"]').attr('content'),
        item: items,
    });
};
