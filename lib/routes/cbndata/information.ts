import path from 'node:path';

import { type CheerioAPI, load } from 'cheerio';
import { type Context } from 'hono';

import { type Data, type DataItem, type Route, ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';

export const handler = async (ctx: Context): Promise<Data> => {
    const { id = 'all' } = ctx.req.param();
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '50', 10);

    const baseUrl: string = 'https://www.cbndata.com';
    const targetUrl: string = new URL(`information?tag_id=${id}`, baseUrl).href;
    const apiUrl: string = new URL('api/v3/informations', baseUrl).href;

    const targetResponse = await ofetch(targetUrl);
    const $: CheerioAPI = load(targetResponse);
    const language = $('html').attr('lang') ?? 'zh';

    const response = await ofetch(apiUrl, {
        query: {
            page: 1,
            per_page: limit,
        },
    });

    let items: DataItem[] = [];

    items = response.data.slice(0, limit).map((item): DataItem => {
        const title: string = item.title;
        const image: string | undefined = item.image;
        const description: string | undefined = art(path.join(__dirname, 'templates/description.art'), {
            images: image
                ? [
                      {
                          src: image,
                          alt: title,
                      },
                  ]
                : undefined,
        });
        const pubDate: number | string = item.date;
        const linkUrl: string | undefined = item.id ? `information/${item.id}` : undefined;
        const categories: string[] = item.tags;
        const guid: string = `cbndata-information-${item.id}`;
        const updated: number | string = pubDate;

        const processedItem: DataItem = {
            title,
            description,
            pubDate: pubDate ? parseDate(pubDate) : undefined,
            link: linkUrl ? new URL(linkUrl, baseUrl).href : undefined,
            category: categories,
            guid,
            id: guid,
            content: {
                html: description,
                text: description,
            },
            image,
            banner: image,
            updated: updated ? parseDate(updated) : undefined,
            language,
        };

        return processedItem;
    });

    items = await Promise.all(
        items.map((item) => {
            if (!item.link) {
                return item;
            }

            return cache.tryGet(item.link, async (): Promise<DataItem> => {
                const detailResponse = await ofetch(item.link);

                const dataStr: string | undefined = detailResponse.match(/<script>window\.__INITIAL_STATE__=(.*?);<\/script>/)?.[1];

                if (!dataStr) {
                    return item;
                }

                const data = JSON.parse(dataStr)?.data;

                if (!data) {
                    return item;
                }

                const title: string = data.title;
                const description: string | undefined =
                    item.description +
                    art(path.join(__dirname, 'templates/description.art'), {
                        description: data.content,
                    });
                const pubDate: number | string = data.date;
                const linkUrl: string | undefined = data.id ? `information/${data.id}` : undefined;
                const categories: string[] = [...new Set(((data.tags?.map((c) => c.name) ?? []) as string[]).filter(Boolean))];
                const authors: DataItem['author'] = [
                    {
                        name: data.author,
                        url: undefined,
                        avatar: undefined,
                    },
                ];
                const guid: string = `cbndata-information-${data.id}`;
                const image: string | undefined = data.thumbnail_url;
                const updated: number | string = pubDate;

                const processedItem: DataItem = {
                    title,
                    description,
                    pubDate: pubDate ? parseDate(pubDate) : undefined,
                    link: linkUrl ? new URL(linkUrl, baseUrl).href : undefined,
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
                    updated: updated ? parseDate(updated) : undefined,
                    language,
                };

                return {
                    ...item,
                    ...processedItem,
                };
            });
        })
    );

    const tag: string = response.home_tags.find((t: { id: number; name: string }) => String(t.id) === id)?.name ?? '';
    const title: string = `${tag ? `${tag}-` : ''}${$('title').text().trim()}`;

    return {
        title,
        description: $('meta[name="description"]').attr('content'),
        link: targetUrl,
        item: items,
        allowEmpty: true,
        image: $('img.logo-logoImage').attr('src'),
        author: title.split(/\|/).pop(),
        language,
        id: targetUrl,
    };
};

export const route: Route = {
    path: '/information/:id?',
    name: '看点',
    url: 'www.cbndata.com',
    maintainers: ['nczitzk'],
    handler,
    example: '/cbndata/information/all',
    parameters: {
        id: {
            description: '分类，默认为 `all`，即全部，可在对应分类页 URL 中找到',
            options: [
                {
                    label: '全部',
                    value: 'all',
                },
                {
                    label: '美妆个护',
                    value: '1',
                },
                {
                    label: '服饰鞋包',
                    value: '2559',
                },
                {
                    label: '宠物',
                    value: '2419',
                },
                {
                    label: '营销',
                    value: '2484',
                },
            ],
        },
    },
    description: `::: tip
订阅 [美妆个护](https://www.cbndata.com/information?tag_id=1)，其源网址为 \`https://www.cbndata.com/information?tag_id=1\`，请参考该 URL 指定部分构成参数，此时路由为 [\`/cbndata/information/1\`](https://rsshub.app/cbndata/information/1)。
:::

| 分类                                                        | ID                                                  |
| ----------------------------------------------------------- | --------------------------------------------------- |
| [全部](https://www.cbndata.com/information?tag_id=all)      | [all](https://rsshub.app/cbndata/information/all)   |
| [美妆个护](https://www.cbndata.com/information?tag_id=1)    | [1](https://rsshub.app/cbndata/information/1)       |
| [服饰鞋包](https://www.cbndata.com/information?tag_id=2559) | [2559](https://rsshub.app/cbndata/information/2559) |
| [宠物](https://www.cbndata.com/information?tag_id=2419)     | [2419](https://rsshub.app/cbndata/information/2419) |
| [营销](https://www.cbndata.com/information?tag_id=2484)     | [2484](https://rsshub.app/cbndata/information/2484) |
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
            source: ['www.cbndata.com/information'],
            target: (params, url) => {
                const urlObj: URL = new URL(url);
                const id: string | undefined = urlObj.searchParams.get('tag_id') ?? undefined;

                return `/information${id ? `/${id}` : ''}`;
            },
        },
        {
            title: '全部',
            source: ['www.cbndata.com/information'],
            target: '/information/all',
        },
        {
            title: '美妆个护',
            source: ['www.cbndata.com/information'],
            target: '/information/1',
        },
        {
            title: '服饰鞋包',
            source: ['www.cbndata.com/information'],
            target: '/information/2559',
        },
        {
            title: '宠物',
            source: ['www.cbndata.com/information'],
            target: '/information/2419',
        },
        {
            title: '营销',
            source: ['www.cbndata.com/information'],
            target: '/information/2484',
        },
    ],
    view: ViewType.Articles,
};
