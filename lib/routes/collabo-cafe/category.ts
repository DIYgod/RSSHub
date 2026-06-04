import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Data, Route } from '@/types';
import ofetch from '@/utils/ofetch';

import { parseItems } from './parser';

export const handler = async (ctx: Context): Promise<Data | null> => {
    const { category } = ctx.req.param();
    const baseUrl = `https://collabo-cafe.com/events/category/${category}`;
    const res = await ofetch(baseUrl);
    const $ = load(res);
    const items = parseItems($);

    return {
        title: '分类',
        link: baseUrl,
        item: items,
    };
};

export const route: Route = {
    path: '/category/:category',
    categories: ['anime'],
    example: '/collabo-cafe/category/cafe',
    parameters: { category: 'Category, refer to the original website (ジャンル別)' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '分类',
    maintainers: ['cokemine'],
    handler,
};
