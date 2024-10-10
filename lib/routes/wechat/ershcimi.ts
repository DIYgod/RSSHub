import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { finishArticleItem } from '@/utils/wechat-mp';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/ershicimi/:id',
    categories: ['new-media'],
    example: '/wechat/ershicimi/813oxJOl',
    parameters: { id: '公众号id，打开公众号页，在 URL 中找到 id' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '公众号（二十次幂来源）',
    maintainers: ['sanmmm'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const rootUrl = 'https://www.cimidata.com';

    const url = `${rootUrl}/a/${id}`;
    const response = await got(url);
    const $ = load(response.data);
    const items = $('.weui_media_box')
        .map((_, ele) => {
            const $item = load(ele);
            const link = $item('.weui_media_title a').attr('href');
            return {
                title: $item('.weui_media_title a').text(),
                description: $item('.weui_media_desc').text(),
                link,
                pubDate: timezone(parseDate($item('.weui_media_extra_info').attr('title')), +8),
            };
        })
        .toArray();

    return {
        title: `微信公众号 - ${$('span.name').text()}`,
        link: url,
        description: $('div.Profile-sideColumnItemValue').text(),
        item: await Promise.all(items.map((item) => finishArticleItem(item))).catch((error) => {
            throw error;
        }),
    };
}
