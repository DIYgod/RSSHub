import type { CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import ofetch from '@/utils/ofetch';

import { baseUrl, ProcessItems } from './util';

export const handler = async (ctx: Context): Promise<Data> => {
    const { id = '0' } = ctx.req.param();
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '30', 10);

    const targetUrl: string = new URL('news', baseUrl).href;
    const apiUrl: string = new URL(`news/getNewsIndexList/${id}`, baseUrl).href;

    const targetResponse = await ofetch(targetUrl);
    const $: CheerioAPI = load(targetResponse);
    const language = $('html').attr('lang') ?? 'zh-CN';

    const response = await ofetch(apiUrl);

    const items: DataItem[] = await ProcessItems(limit, response.data.dataList);

    const title: string | undefined = $(`div.whale_news_index-content-tab li[data_id="${id}"]`).text();

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
    path: '/news/:id?',
    name: '鲸闻',
    url: 'www.dgtle.com',
    maintainers: ['nczitzk'],
    handler,
    example: '/dgtle/news/0',
    parameters: {
        id: {
            description: '分类，默认为 `0`，即最新，可在下表中找到',
            options: [
                {
                    label: '最新',
                    value: '0',
                },
                {
                    label: '直播',
                    value: '395',
                },
                {
                    label: '资讯',
                    value: '396',
                },
                {
                    label: '每日一言',
                    value: '388',
                },
            ],
        },
    },
    description: `:::tip
订阅 [最新](https://www.dgtle.com/news)，其对应分类 ID 为 \`0\`，此时路由为 [\`/dgtle/news/0\`](https://rsshub.app/dgtle/news/0)。
:::

| 最新 | 直播 | 资讯 | 每日一言 |
| ---- | ---- | ---- | -------- |
| 0    | 395  | 396  | 388      |
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
            source: ['www.dgtle.com/news'],
            target: '/news',
        },
        {
            title: '最新',
            source: ['www.dgtle.com/news'],
            target: '/news/0',
        },
        {
            title: '直播',
            source: ['www.dgtle.com/news'],
            target: '/news/395',
        },
        {
            title: '资讯',
            source: ['www.dgtle.com/news'],
            target: '/news/396',
        },
        {
            title: '每日一言',
            source: ['www.dgtle.com/news'],
            target: '/news/388',
        },
    ],
    view: ViewType.Articles,
};
