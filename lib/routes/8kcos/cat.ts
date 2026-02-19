import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';

import loadArticle from './article';
import { SUB_NAME_PREFIX, SUB_URL } from './const';

export const route: Route = {
    path: '/cat/:cat{.+}?',
    radar: [
        {
            source: ['8kcosplay.com/'],
            target: '',
        },
    ],
    name: 'Unknown',
    maintainers: [],
    handler,
    url: '8kcosplay.com/',
    features: {
        nsfw: true,
    },
};

async function handler(ctx) {
    const limit = Number.parseInt(ctx.req.query('limit'));
    const { cat = '8kasianidol' } = ctx.req.param();
    const url = `${SUB_URL}category/${cat}/`;
    const resp = await got(url);
    const $ = load(resp.body);
    const itemRaw = $('li.item').toArray();
    return {
        title: `${SUB_NAME_PREFIX}-${$('span[property=name]:not(.hide)').text()}`,
        link: url,
        item: await Promise.all(
            (limit ? itemRaw.slice(0, limit) : itemRaw).map((e) => {
                const { href } = load(e)('h2 > a')[0].attribs;
                return cache.tryGet(href, () => loadArticle(href));
            })
        ),
    };
}
