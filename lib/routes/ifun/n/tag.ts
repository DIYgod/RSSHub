import type { Context } from 'hono';

import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import ofetch from '@/utils/ofetch';
import { getRouteLimit } from '@/utils/route-limit';

import { apiRoot, author, getRecords, language, processItems, rootUrl } from './util';

export const handler = async (ctx: Context): Promise<Data> => {
    const { name } = ctx.req.param();
    const limit = getRouteLimit(ctx, 30);

    const targetUrl = new URL(`tag/${encodeURIComponent(name)}`, rootUrl).href;
    const apiResponse = await ofetch(`${apiRoot}/post/list/tag`, {
        method: 'POST',
        body: { current: 1, pageSize: limit, searchText: '', tag: name },
    });
    const items: DataItem[] = processItems(getRecords(apiResponse), limit);

    return {
        title: `${author} - ${name}`,
        description: name,
        link: targetUrl,
        item: items,
        author,
        language,
    };
};

export const route: Route = {
    path: '/n/tag/:name',
    name: '盐选故事专栏',
    url: 'iread.life',
    maintainers: ['nczitzk'],
    handler,
    example: '/ifun/n/tag/zhihu',
    parameters: {
        name: '故事集名称，可在对应故事集页 URL 的 /tag/ 后找到',
    },
    description: '例如 [zhihu 故事集](https://iread.life/tag/zhihu) 对应 `/ifun/n/tag/zhihu`。更多故事集请见 [iRead 故事集](https://iread.life/tag)。',
    categories: ['new-media'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [{ source: ['iread.life/tag/:name'], target: '/n/tag/:name' }],
    view: ViewType.Articles,
};
