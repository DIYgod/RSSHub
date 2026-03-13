import type { CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import ofetch from '@/utils/ofetch';

import { baseUrl, ProcessFeedItems } from './util';

export const handler = async (ctx: Context): Promise<Data> => {
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '30', 10);

    const targetUrl: string = new URL('feed', baseUrl).href;
    const apiUrl: string = new URL('feed/getHotDynamic', baseUrl).href;

    const response = await ofetch(apiUrl, {
        query: {
            last_id: 0,
        },
    });

    const targetResponse = await ofetch(targetUrl);
    const $: CheerioAPI = load(targetResponse);
    const language = $('html').attr('lang') ?? 'zh-CN';

    const items: DataItem[] = ProcessFeedItems(limit, response.data.dataList, $);

    return {
        title: $('title').text(),
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
    path: '/feed',
    name: '兴趣',
    url: 'www.dgtle.com',
    maintainers: ['nczitzk'],
    handler,
    example: '/dgtle/feed',
    parameters: undefined,
    description: undefined,
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
            source: ['www.dgtle.com/feed'],
            target: '/feed',
        },
    ],
    view: ViewType.Articles,
};
