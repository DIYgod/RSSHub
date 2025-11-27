import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

import { getItemList as detailItemList } from './detail';
import { ensureDomain } from './utils';

function getItemList($) {
    const list = $(`#vod .list-group-item`)
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('a').text(),
                publishDate: item.find('b').text(),
                link: `https://www.xlmp4.com${item.find('a').attr('href')}`, // fixed domain for guid
            };
        })
        .filter((item) => !item.title.includes('话') && !item.title.includes('集') && !item.title.includes('更新至'));
    return list;
}

export const route: Route = {
    path: '/latest_movie_bt',
    categories: ['multimedia'],
    example: '/domp4/latest_movie_bt',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: true,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['www.xlmp4.com/', 'www.xlmp4.com/custom/update.html'],
        },
    ],
    name: '最近更新的电源BT列表',
    maintainers: ['xianghuawe', 'pseudoyu'],
    handler,
    url: 'www.xlmp4.com/',
};

async function handler(ctx) {
    const { domain, second } = ctx.req.query();
    const hostUrl = ensureDomain(ctx, domain);
    const latestUrl = `${hostUrl}/custom/update.html`;
    const res = await ofetch(latestUrl);
    const $ = load(res);
    const list = getItemList($);
    const process = await Promise.all(
        list.map(
            async (item) =>
                await cache.tryGet(item.link, async () => {
                    const response = await ofetch(item.link);
                    const $ = load(response);
                    return detailItemList($, item.link, second);
                })
        )
    );

    return {
        link: latestUrl,
        title: 'domp4电影',
        item: process.filter((item) => item !== undefined).flat(),
    };
}
