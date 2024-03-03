// @ts-nocheck
const { baseUrl, parsePage } = require('./utils');
import puppeteer from '@/utils/puppeteer';

export default async (ctx) => {
    const browser = await puppeteer();

    const { $, items } = await parsePage('master', browser, ctx);

    await browser.close();

    ctx.set('data', {
        title: $('head title').text(),
        description: $('meta[name=description]').attr('content'),
        link: `${baseUrl}/masterChannel.action?idMasterChannel=${ctx.req.param('channel')}`,
        image: `${baseUrl}/assets_new/img/fbshare.jpg`,
        language: $('meta[property="og:locale"]').attr('content'),
        item: items,
    });
};
