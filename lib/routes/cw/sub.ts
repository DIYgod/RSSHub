import type { Route } from '@/types';
import puppeteer from '@/utils/puppeteer';

import { baseUrl, parsePage } from './utils';

export const route: Route = {
    path: '/sub/:channel',
    categories: ['traditional-media'],
    example: '/cw/sub/615',
    parameters: { channel: '子頻道 ID，可在 URL 中找到' },
    features: {
        requireConfig: false,
        requirePuppeteer: true,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '子頻道',
    maintainers: ['TonyRL'],
    handler,
};

async function handler(ctx) {
    const browser = await puppeteer();

    const { $, items } = await parsePage('sub', browser, ctx);

    await browser.close();

    return {
        title: $('head title').text(),
        description: $('meta[name=description]').attr('content'),
        link: `${baseUrl}/subchannel.action?idSubChannel=${ctx.req.param('channel')}`,
        image: `${baseUrl}/assets_new/img/fbshare.jpg`,
        language: $('meta[property="og:locale"]').attr('content'),
        item: items,
    };
}
