import type { Context } from 'hono';

import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import ofetch from '@/utils/ofetch';
import { getRouteLimit } from '@/utils/route-limit';

import { apiRoot, author, getRecords, language, processItems, rootUrl } from './util';

export const handler = async (ctx: Context): Promise<Data> => {
    const { keywords } = ctx.req.param();
    const limit = getRouteLimit(ctx, 30);

    const targetUrl = new URL('articles', rootUrl).href;
    const apiResponse = await ofetch(`${apiRoot}/post/list`, {
        method: 'POST',
        body: { current: 1, pageSize: limit, searchText: keywords },
    });
    const items: DataItem[] = processItems(getRecords(apiResponse), limit);

    return {
        title: `${author} - ${keywords}`,
        description: keywords,
        link: targetUrl,
        item: items,
        author,
        language,
    };
};

export const route: Route = {
    path: '/n/search/:keywords',
    name: '盐选故事搜索',
    url: 'iread.life',
    maintainers: ['nczitzk'],
    handler,
    example: '/ifun/n/search/NPC',
    parameters: {
        keywords: '搜索关键字',
    },
    description: '在 [iRead 故事](https://iread.life/articles) 页面输入搜索词。例如关键词 `NPC` 对应 `/ifun/n/search/NPC`。网站搜索条件不保存在 URL 中，请手动填写路由关键词。',
    categories: ['new-media'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    view: ViewType.Articles,
};
