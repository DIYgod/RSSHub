import { Route } from '@/types';
import { baseUrl, parsePage } from './utils';
import puppeteer from '@/utils/puppeteer';

export const route: Route = {
    path: '/master/:channel',
    categories: ['bbs'],
    example: '/cw/master/8',
    parameters: { channel: '主頻道 ID，可在 URL 中找到' },
    features: {
        requireConfig: false,
        requirePuppeteer: true,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '主頻道',
    maintainers: ['TonyRL'],
    handler,
};

async function handler(ctx) {
    const browser = await puppeteer();

    const { $, items } = await parsePage('master', browser, ctx);

    await browser.close();

    return {
        title: $('head title').text(),
        description: $('meta[name=description]').attr('content'),
        link: `${baseUrl}/masterChannel.action?idMasterChannel=${ctx.req.param('channel')}`,
        image: `${baseUrl}/assets_new/img/fbshare.jpg`,
        language: $('meta[property="og:locale"]').attr('content'),
        item: items,
    };
}
