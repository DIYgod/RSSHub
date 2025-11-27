import type { Context } from 'hono';

import type { Data, Route } from '@/types';
import { ViewType } from '@/types';

import { baseUrl, processItems } from './util';

let viewType: ViewType = ViewType.Articles;

export const handler = async (ctx: Context): Promise<Data> => {
    const { id, tab } = ctx.req.param();
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '30', 10);

    const targetUrl: string = new URL(`tags/${id}/originals${tab ? `?tab=${tab}` : ''}`, baseUrl).href;
    const apiUrl: string = new URL(`gapi/v1/tags/${id}/${tab ?? 'originals'}`, baseUrl).href;

    const query = {
        'page[limit]': limit,
        sort: '-published-at',
        include: 'category,user,media',
        'filter[list-all]': 1,
        'filter[is-news]': tab === 'news' ? 1 : 0,
    };

    if (tab === 'radios') {
        viewType = ViewType.Audios;
    } else if (tab === 'videos') {
        viewType = ViewType.Videos;
    }

    return await processItems(limit, query, apiUrl, targetUrl);
};

export const route: Route = {
    path: '/tags/:id/:tab?',
    name: '标签',
    url: 'www.gcores.com',
    maintainers: ['StevenRCE0', 'nczitzk'],
    handler,
    example: '/gcores/tags/1/articles',
    parameters: {
        id: {
            description: '标签 ID，可在对应标签页 URL 中找到',
        },
        tab: {
            description: '类型，默认为空，即全部，可在对应标签页 URL 中找到',
            options: [
                {
                    label: '全部',
                    value: '',
                },
                {
                    label: '播客',
                    value: 'radios',
                },
                {
                    label: '文章',
                    value: 'articles',
                },
                {
                    label: '资讯',
                    value: 'news',
                },
                {
                    label: '视频',
                    value: 'videos',
                },
            ],
        },
    },
    description: `::: tip
若订阅 [美国 - 文章](https://www.gcores.com/tags/1/originals?tab=articles)，网址为 \`https://www.gcores.com/tags/1/originals?tab=articles\`，请截取 \`https://www.gcores.com/tags/\` 到末尾 \`/originals\` 的部分 \`1\` 作为 \`id\` 参数填入，截取 \`articles\` 作为 \`tab\` 参数填入，此时目标路由为 [\`/gcores/tags/1/articles\`](https://rsshub.app/gcores/tags/1/articles)。
:::

| 全部 | 播客   | 文章     | 资讯 | 视频   |
| ---- | ------ | -------- | ---- | ------ |
|      | radios | articles | news | videos |
`,
    categories: ['game'],
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
            source: ['www.gcores.com/tags/:id/originals'],
            target: (params, url) => {
                const urlObj: URL = new URL(url);
                const id: string = params.id;
                const tab: string | undefined = urlObj.searchParams.get('tab') ?? undefined;

                return `/gcores/tags/${id}/${tab ? `/${tab}` : ''}`;
            },
        },
        {
            title: '全部',
            source: ['www.gcores.com/tags/:id/originals'],
            target: '/gcores/tags/:id',
        },
        {
            title: '播客',
            source: ['www.gcores.com/tags/:id/originals'],
            target: '/gcores/tags/:id/radios',
        },
        {
            title: '文章',
            source: ['www.gcores.com/tags/:id/originals'],
            target: '/gcores/tags/:id/articles',
        },
        {
            title: '资讯',
            source: ['www.gcores.com/tags/:id/originals'],
            target: '/gcores/tags/:id/news',
        },
        {
            title: '视频',
            source: ['www.gcores.com/tags/:id/originals'],
            target: '/gcores/tags/:id/videos',
        },
    ],
    view: viewType,
};
