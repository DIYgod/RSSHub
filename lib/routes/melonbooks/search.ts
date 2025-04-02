import { Data, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { parseItems } from './parser';
import { Context } from 'hono';
import querystring from 'querystring';

export const handler = async (ctx: Context): Promise<Data | null> => {
    const baseUrl = 'https://www.melonbooks.co.jp';
    const query = ctx.req.param('query') ?? '';
    const url = `${baseUrl}/search/search.php?${query}`;
    const fetchRestrictedContent = querystring.parse(query).adult_view === '1';

    const res = await ofetch(url);
    const $ = load(res);
    const items = await parseItems($, baseUrl, fetchRestrictedContent);

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
    description: `::: tip
如果你期望获取限制级内容，可以添加\`&adult_view=1\`参数
:::`,
    handler,
};
