import { load } from 'cheerio';

import { wafFetch } from '@/routes/mafengwo/utils';
import type { Route } from '@/types';
import { ViewType } from '@/types';
import ofetch from '@/utils/ofetch';

import { getHeaders, parseSearchDate } from './utils';

export const route: Route = {
    path: '/keyword/:keyword',
    categories: ['shopping'],
    view: ViewType.Notifications,
    example: '/smzdm/keyword/女装',
    parameters: { keyword: '你想订阅的关键词' },
    features: {
        requireConfig: [
            {
                name: 'SMZDM_COOKIE',
                optional: true,
                description: '什么值得买登录后的 Cookie 值',
            },
        ],
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '关键词',
    maintainers: ['DIYgod', 'MeanZhang'],
    handler,
};

async function handler(ctx) {
    const keyword = ctx.req.param('keyword');

    const url = `https://search.smzdm.com/?${new URLSearchParams({
        c: 'home',
        s: keyword,
        order: 'time',
        v: 'a',
        mx_v: 'a',
    })}`;
    const headers = getHeaders();
    const data = await (headers.cookie ? ofetch<string>(url, { headers }) : wafFetch<string>(url));

    const $ = load(data);
    const list = $('.feed-row-wide');

    return {
        title: `${keyword} - 什么值得买`,
        link: `https://search.smzdm.com/?c=home&s=${encodeURIComponent(keyword)}&order=time`,
        item: list
            .toArray()
            .filter((item) => $(item).find('.feed-block-title a').attr('href'))
            .map((item) => {
                const $item = $(item);
                return {
                    title: `${$item.find('.feed-block-title a').eq(0).text().trim()} - ${$item.find('.z-highlight').text().trim()}`,
                    description: `${$item.find('.feed-block-descripe-top').text()}<br>${$item.find('.feed-block-extras span').text()}<br><img src="http:${$item.find('.z-feed-img img').attr('src')}">`,
                    category: $item
                        .find('.feed-block-tags a')
                        .toArray()
                        .map((tag) => $(tag).text()),
                    pubDate: parseSearchDate($item.find('.feed-block-extras').contents().eq(0).text().trim()),
                    link: $item.find('.feed-block-title a').attr('href'),
                };
            }),
    };
}
