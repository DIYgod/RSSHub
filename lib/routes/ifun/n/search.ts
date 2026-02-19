import type { Context } from 'hono';

import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import ofetch from '@/utils/ofetch';

import { author, language, processItems, rootUrl } from './util';

export const handler = async (ctx: Context): Promise<Data> => {
    const { keywords } = ctx.req.param();
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '30', 10);

    const targetUrl: string = new URL(`search-result/?s=${keywords}`, rootUrl).href;
    const apiUrl: string = new URL('api/articles/searchkeywords', rootUrl).href;

    const apiResponse = await ofetch(apiUrl, {
        query: {
            keywords,
            current: 1,
            size: limit,
        },
    });

    const items: DataItem[] = processItems(apiResponse.data.records, limit);

    return {
        title: `${author} - ${keywords}`,
        description: keywords,
        link: targetUrl,
        item: items,
        allowEmpty: true,
        author,
        language,
    };
};

export const route: Route = {
    path: '/n/search/:keywords',
    name: '盐选故事搜索',
    url: 'n.ifun.cool',
    maintainers: ['nczitzk'],
    handler,
    example: '/ifun/n/search/NPC',
    parameters: {
        keywords: '搜索关键字',
    },
    description: `::: tip
若订阅 [关键词：NPC](https://n.ifun.cool/search-result/?s=NPC)，网址为 \`https://n.ifun.cool/search-result/?s=NPC\`，请截取 \`s\` 的值 \`NPC\` 作为 \`keywords\` 参数填入，此时目标路由为 [\`/ifun/n/search/NPC\`](https://rsshub.app/ifun/n/search/NPC)。
:::
    `,
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
    radar: [
        {
            source: ['n.ifun.cool/search-result'],
            target: (_, url) => {
                const urlObj = new URL(url);
                const keywords = urlObj.searchParams.get('s');

                return `/ifun/n/search/${keywords}`;
            },
        },
    ],
    view: ViewType.Articles,
};
