import { load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import { PRESETS } from '@/utils/header-generator';
import ofetch from '@/utils/ofetch';

import { baseUrl, parseItem, parseList } from './utils';

export const route: Route = {
    path: '/tag/:tag',
    categories: ['new-media'],
    example: '/byteclicks/tag/人工智能',
    parameters: { tag: '标签，可在URL中找到' },
    radar: [
        {
            source: ['byteclicks.com/tag/:tag'],
        },
    ],
    name: '标签',
    maintainers: ['TonyRL'],
    handler,
    url: 'byteclicks.com/',
};

async function handler(ctx) {
    const tag = ctx.req.param('tag');
    const link = `${baseUrl}/tag/${tag}`;

    const response = await ofetch(link, { headerGeneratorOptions: PRESETS.MODERN_WINDOWS_CHROME });
    const $ = load(response);

    const list = parseList($).slice(0, ctx.req.query('limit') ? Number(ctx.req.query('limit')) : undefined);
    const items = await pMap(list, (item) => parseItem(item), { concurrency: 5 });

    return {
        title: $('head title').text(),
        image: $('head link[rel="shortcut icon"]').attr('href'),
        link,
        item: items,
    };
}
