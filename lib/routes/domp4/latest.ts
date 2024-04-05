import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';

import { defaultDomain, ensureDomain } from './utils';

function getItemList($, type) {
    const list = $(`#${type} .list-group-item`)
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('a').text(),
                link: `https://${defaultDomain}${item.find('a').attr('href')}`, // fixed domain for guid
            };
        });
    return list;
}

export const route: Route = {
    path: '/latest/:type?',
    categories: ['multimedia'],
    example: '/domp4/latest/vod',
    parameters: { type: '`vod` 代表电影，`tv` 代表电视剧，默认 vod' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['domp4.cc/', 'domp4.cc/custom/update.html'],
        },
    ],
    name: '最近更新',
    maintainers: ['savokiss'],
    handler,
    url: 'domp4.cc/',
};

async function handler(ctx) {
    const { type = 'vod' } = ctx.req.param();
    const { domain } = ctx.req.query();

    const hostUrl = ensureDomain(ctx, domain);
    const latestUrl = `${hostUrl}/custom/update.html`;

    const res = await got.get(latestUrl);
    const $ = load(res.data);
    const list = getItemList($, type);

    return {
        link: latestUrl,
        title: 'domp4电影',
        item: list,
    };
}
