import { load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import { PRESETS } from '@/utils/header-generator';
import ofetch from '@/utils/ofetch';

import { baseUrl, parseItem, parseList } from './utils';

export const route: Route = {
    path: '/',
    categories: ['new-media'],
    example: '/byteclicks',
    radar: [
        {
            source: ['byteclicks.com/'],
        },
    ],
    name: '首页',
    maintainers: ['TonyRL'],
    handler,
    url: 'byteclicks.com/',
};

async function handler(ctx) {
    const response = await ofetch(baseUrl, { headerGeneratorOptions: PRESETS.MODERN_WINDOWS_CHROME });
    const $ = load(response);

    const list = parseList($).slice(0, ctx.req.query('limit') ? Number(ctx.req.query('limit')) : undefined);
    const items = await pMap(list, (item) => parseItem(item), { concurrency: 5 });

    return {
        title: $('head title').text(),
        description: $('head meta[name="description"]').attr('content'),
        image: $('head link[rel="shortcut icon"]').attr('href'),
        link: baseUrl,
        item: items,
    };
}
