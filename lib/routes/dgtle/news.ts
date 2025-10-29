import { type Data, type DataItem, type Route, ViewType } from '@/types';

import { art } from '@/utils/render';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import { type CheerioAPI, load } from 'cheerio';
import { type Context } from 'hono';
import path from 'node:path';

export const handler = async (ctx: Context): Promise<Data> => {
    const { id = '0' } = ctx.req.param();
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '30', 10);

    const baseUrl: string = 'https://www.dgtle.com';
    const targetUrl: string = new URL('news', baseUrl).href;
    const apiUrl: string = new URL(`news/getNewsIndexList/${id}`, baseUrl).href;

    const targetResponse = await ofetch(targetUrl);
    const $: CheerioAPI = load(targetResponse);
    const language = $('html').attr('lang') ?? 'zh-CN';

    const response = await ofetch(apiUrl);

    let items: DataItem[] = [];

    items = response.data.dataList.slice(0, limit).map((item): DataItem => {
        const title: string = item.title || item.content;
        const image: string | undefined = item.cover;
        const description: string | undefined = art(path.join(__dirname, 'templates/description.art'), {
            images: image
                ? [
                      {
                          src: image,
                          alt: title,
                      },
                  ]
                : undefined,
            description: item.content,
        });
        const pubDate: number | string = item.created_at;
        const linkUrl: string | undefined = `${item.live_status === undefined ? 'news' : 'live'}-${item.id}-1.html`;
        const categories: string[] = [item.column];
        const authors: DataItem['author'] = [
            {
                name: item.user?.username,
                url: new URL(`user?uid=${item.user_id}`, baseUrl).href,
                avatar: item.user?.avatar_path,
            },
        ];
        const guid: string = `dgtle-${item.id}`;
        const updated: number | string = pubDate;

        const processedItem: DataItem = {
            title,
            description,
            pubDate: pubDate ? timezone(parseDate(pubDate, 'X'), +8) : undefined,
            link: new URL(linkUrl, baseUrl).href,
            category: categories,
            author: authors,
            guid,
            id: guid,
            content: {
                html: description,
                text: description,
            },
            image,
            banner: image,
            updated: updated ? timezone(parseDate(updated, 'X'), +8) : undefined,
            language,
            live_status: item.live_status,
        };

        return processedItem;
    });

    items = await Promise.all(
        items.map((item) => {
            if (item.live_status !== undefined || !item.link) {
                delete item.live_status;
                return item;
            }

            delete item.live_status;

            return cache.tryGet(item.link, async (): Promise<DataItem> => {
                const detailResponse = await ofetch(item.link);
                const $$: CheerioAPI = load(detailResponse);

                $$('div.logo').remove();
                $$('p.tip').remove();
                $$('p.dgtle').remove();

                const description: string | undefined = art(path.join(__dirname, 'templates/description.art'), {
                    description: $$('div.whale_news_detail-daily-content, div#articleContent').html(),
                });

                const processedItem: DataItem = {
                    description,
                    language,
                };

                return {
                    ...item,
                    ...processedItem,
                };
            });
        })
    );

    return {
        title: `${$('title').text().trim().split(/\s/)[0]} - ${$(`div.whale_news_index-content-tab li[data_id="${id}"]`).text()}`,
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
        category: {
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
