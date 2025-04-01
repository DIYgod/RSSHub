import { Data, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { parseItems } from './parser';
import { Context } from 'hono';

export const handler = async (ctx: Context): Promise<Data | null> => {
    const baseUrl = 'https://www.melonbooks.co.jp';
    const query = ctx.req.param('query') ?? '';
    const url = `${baseUrl}/search/search.php?${query}`;
    const res = await ofetch(url);
    const $ = load(res);
    const items = await parseItems($, baseUrl);

    return {
        title: '搜索结果',
        link: url,
        item: items,
    };
};

export const route: Route = {
    path: '/search/:query?',
    categories: ['anime'],
    example: '/melonbooks/search/name=けいおん',
    parameters: { category: '链接参数，对应网址问号后的内容，不携带问号' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '搜索结果',
    maintainers: ['cokemine'],
    handler,
};
