import type { CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import ofetch from '@/utils/ofetch';

import { baseUrl, ProcessFeedItems } from './util';

export const handler = async (ctx: Context): Promise<Data> => {
    const { id } = ctx.req.param();
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '10', 10);

    const targetUrl: string = new URL(`tag-${id}-1.html`, baseUrl).href;
    const apiUrl: string = new URL(`tag/getDynamicList/${id}`, baseUrl).href;

    const targetResponse = await ofetch(targetUrl);
    const $: CheerioAPI = load(targetResponse);
    const language = $('html').attr('lang') ?? 'zh-CN';

    const response = await ofetch(apiUrl, {
        query: {
            page: 1,
            type: 2,
        },
    });

    const items: DataItem[] = ProcessFeedItems(limit, response.data.dataList, $);

    const title: string | undefined = $(`div.tags-detail-top-1 h2`).text();

    return {
        title: `${$('title').text().trim().split(/\s/)[0]}${title ? ` - ${title}` : id}`,
        description: $('meta[name="description"]').attr('content'),
        link: targetUrl,
        item: items,
        allowEmpty: true,
        author: $('meta[name="keywords"]').attr('content')?.split(/,/)[0] ?? undefined,
        language,
        id: targetUrl,
    };
};

export const route: Route = {
    path: '/tag/:id',
    name: '标签',
    url: 'www.dgtle.com',
    maintainers: ['nczitzk'],
    handler,
    example: '/dgtle/tag/394',
    parameters: {
        id: {
            description: '标签 ID，可在对应标签页 URL 中找到',
        },
    },
    description: `:::tip
订阅 [#手机讨论区](https://www.dgtle.com/tag-394-1.html)，其源网址为 \`https://www.dgtle.com/tag-394-1.html\`，请参考该 URL 指定部分构成参数，此时路由为 [\`/dgtle/tag/394\`](https://rsshub.app/dgtle/tag/394)。
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
            source: [String.raw`www.dgtle.com/$tag-:id-\d+.html`],
            target: '/tag/:id',
        },
    ],
    view: ViewType.Articles,
};
