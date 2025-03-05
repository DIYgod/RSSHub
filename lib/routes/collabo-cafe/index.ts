import { Data, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { Context } from 'hono';
import { parseItems } from './parser';

export const handler = async (ctx: Context): Promise<Data | null> => {
    const baseUrl = 'https://collabo-cafe.com/';
    const { page } = ctx.req.param();
    const res = await ofetch(page ? `${baseUrl}/page/${page}` : baseUrl);
    const $ = load(res);
    const items = parseItems($);

    return {
        title: '全部文章',
        link: baseUrl,
        item: items,
    };
};

export const route: Route = {
    path: '/:page?',
    categories: ['anime'],
    example: '/collabo-cafe/',
    parameters: undefined,
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '全部文章',
    maintainers: ['cokemine'],
    handler,
};
