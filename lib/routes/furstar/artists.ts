import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

import utils from './utils';

export const route: Route = {
    path: '/artists/:lang?',
    categories: ['shopping'],
    example: '/furstar/artists/cn',
    parameters: { lang: '语言, 留空为jp, 支持cn, en' },
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
            source: ['furstar.jp/'],
            target: '/artists',
        },
    ],
    name: '画师列表',
    maintainers: ['NeverBehave'],
    handler,
    url: 'furstar.jp/',
};

async function handler(ctx) {
    const base = utils.langBase(ctx.req.param('lang'));
    const res = await got.get(base, {
        https: {
            rejectUnauthorized: false,
        },
    });
    const $ = load(res.data);
    const artists = $('.filter-item')
        .toArray()
        .map((e) => utils.authorDetail(e));
    artists.shift(); // the first one is "show all"

    return {
        title: 'furstar 所有画家',
        link: 'https://furstar.jp',
        description: 'Furstar 所有画家列表',
        language: ctx.req.param('lang'),
        item: artists.map((e) => ({
            title: e.name,
            author: e.name,
            description: `<img src="${e.avatar}"/><a href="${base}/${e.link}">${e.name}</a>`,
            pubDate: parseDate(new Date().toISOString()), // No Time for now
            link: `${base}/${e.link}`,
        })),
    };
}
