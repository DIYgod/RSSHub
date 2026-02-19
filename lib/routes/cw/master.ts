import type { Route } from '@/types';
import puppeteer from '@/utils/puppeteer';

import { baseUrl, parsePage } from './utils';

export const route: Route = {
    path: '/master/:channel',
    categories: ['traditional-media'],
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
    description: `| 主頻道名稱 | 主頻道 ID |
| ---------- | --------- |
| 財經       | 8         |
| 產業       | 7         |
| 國際       | 9         |
| 管理       | 10        |
| 環境       | 12        |
| 教育       | 13        |
| 人物       | 14        |
| 政治社會   | 77        |
| 調查排行   | 15        |
| 健康關係   | 79        |
| 時尚品味   | 11        |
| 運動生活   | 103       |
| 重磅外媒   | 16        |`,
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
