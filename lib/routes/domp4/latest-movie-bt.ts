import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { getItemList as detailItemList } from './detail';

import { defaultDomain, ensureDomain } from './utils';
import cache from '@/utils/cache';

function getItemList($) {
    const list = $(`#vod .list-group-item`)
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('a').text(),
                publishDate: item.find('b').text(),
                link: `https://${defaultDomain}${item.find('a').attr('href')}`, // fixed domain for guid
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
            source: ['domp4.cc/', 'domp4.cc/custom/update.html'],
        },
    ],
    name: '最近更新的电源BT列表',
    maintainers: ['xianghuawe'],
    handler,
    url: 'domp4.cc/',
};

async function handler(ctx) {
    const { domain, second } = ctx.req.query();
    const hostUrl = ensureDomain(ctx, domain);
    const latestUrl = `${hostUrl}/custom/update.html`;
    const res = await got.get(latestUrl);
    const $ = load(res.data);
    const list = getItemList($);
    const process = await Promise.all(
        list.map(
            async (item) =>
                await cache.tryGet(item.link, async () => {
                    const response = await got.get(item.link);
                    const $ = load(response.data);
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
