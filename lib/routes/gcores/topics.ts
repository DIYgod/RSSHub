import { type Context } from 'hono';

import { type Data, type Route, ViewType } from '@/types';

import { baseUrl, processItems } from './util';

export const handler = async (ctx: Context): Promise<Data> => {
    const { id } = ctx.req.param();
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '30', 10);

    const targetUrl: string = new URL(`topics/${id ?? 'home'}`, baseUrl).href;
    const apiUrl: string = new URL(`gapi/v1/${id ? `topics/${id}/recommend` : 'talk-original-recommendations'}`, baseUrl).href;

    const query = {
        'page[limit]': limit,
        include: 'talk,talk.topic,talk.user',
        'talk-include': 'topic,user',
    };

    return await processItems(limit, query, apiUrl, targetUrl);
};

export const route: Route = {
    path: ['/topics/:id/recommend', '/topics/recommend'],
    name: '机组推荐',
    url: 'www.gcores.com',
    maintainers: ['nczitzk'],
    handler,
    example: '/gcores/topics/recommend',
    parameters: {
        id: {
            description: '小组 ID，默认为空，即全部，可在对应小组页 URL 中找到',
        },
    },
    description: `::: tip
若订阅 [我的年度总结](https://www.gcores.com/topics/581)，网址为 \`https://www.gcores.com/topics/581\`，请截取 \`https://www.gcores.com/topics/\` 到末尾的部分 \`581\` 作为 \`id\` 参数填入，此时目标路由为 [\`/gcores/topics/581/recommend\`](https://rsshub.app/gcores/topics/581/recommend)。
:::
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
            source: ['www.gcores.com/topics/home'],
            target: '/gcores/topics/recommend',
        },
        {
            source: ['www.gcores.com/topics/:id'],
            target: '/gcores/topics/:id/recommend',
        },
    ],
    view: ViewType.SocialMedia,
};
