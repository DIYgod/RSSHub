import { Data, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { Context } from 'hono';
import { parseItems } from './parser';

export const handler = async (ctx: Context): Promise<Data | null> => {
    const { tag } = ctx.req.param();
    const baseUrl = `https://collabo-cafe.com/events/tag/${tag}`;
    const res = await ofetch(baseUrl);
    const $ = load(res);
    const items = parseItems($);

    return {
        title: '标签',
        link: baseUrl,
        item: items,
    };
};

export const route: Route = {
    path: '/tag/:tag',
    categories: ['anime'],
    example: '/collabo-cafe/tag/ikebukuro',
    parameters: { tag: 'Tag, refer to the original website (開催地域別)' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '标签',
    maintainers: ['cokemine'],
    handler,
};
