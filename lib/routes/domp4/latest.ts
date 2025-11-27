import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

import { ensureDomain } from './utils';

function getItemList($, type) {
    const list = $(`#${type} .list-group-item`)
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('a').text(),
                link: `https://www.xlmp4.com${item.find('a').attr('href')}`,
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
            source: ['www.xlmp4.com/', 'www.xlmp4.com/custom/update.html'],
        },
    ],
    name: '最近更新',
    maintainers: ['savokiss', 'pseudoyu'],
    handler,
    url: 'www.xlmp4.com/',
};

async function handler(ctx) {
    const { type = 'vod' } = ctx.req.param();
    const { domain } = ctx.req.query();

    const hostUrl = ensureDomain(ctx, domain);
    const latestUrl = `${hostUrl}/custom/update.html`;

    const res = await ofetch(latestUrl);
    const $ = load(res);
    const list = getItemList($, type);

    return {
        link: latestUrl,
        title: 'domp4电影',
        item: list,
    };
}
