import type { CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const handler = async (ctx: Context): Promise<Data> => {
    const { category } = ctx.req.param();
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '100', 10);

    const apiSlug = 'wp-json/wp/v2';
    const baseUrl: string = 'https://60s.aa1.cn';

    const apiUrl = new URL(`${apiSlug}/posts`, baseUrl).href;
    const apiSearchUrl = new URL(`${apiSlug}/categories`, baseUrl).href;

    const searchResponse = await ofetch(apiSearchUrl, {
        query: {
            search: category,
        },
    });

    const categoryObj = searchResponse.find((c) => c.slug === category || c.name === category);
    const categoryId: number | undefined = categoryObj?.id ?? undefined;
    const categorySlug: string | undefined = categoryObj?.slug ?? undefined;

    const response = await ofetch(apiUrl, {
        query: {
            _embed: 'true',
            per_page: limit,
            categories: categoryId,
        },
    });

    const targetUrl: string = new URL(categorySlug ? `category/${categorySlug}` : '', baseUrl).href;

    const targetResponse = await ofetch(targetUrl);
    const $: CheerioAPI = load(targetResponse);
    const language = $('html').attr('lang') ?? 'zh';

    let items: DataItem[] = [];

    items = response.slice(0, limit).map((item): DataItem => {
        const title: string = item.title?.rendered ?? item.title;
        const description: string | undefined = item.content.rendered;
        const pubDate: number | string = item.date_gmt;
        const linkUrl: string | undefined = item.link;

        const terminologies = item._embedded?.['wp:term'];

        const categories: string[] = terminologies?.flat().map((c) => c.name) ?? [];
        const authors: DataItem['author'] =
            item._embedded?.author.map((author) => ({
                name: author.name,
                url: author.link,
                avatar: author.avatar_urls?.['96'] ?? author.avatar_urls?.['48'] ?? author.avatar_urls?.['24'] ?? undefined,
            })) ?? [];
        const guid: string = item.guid?.rendered ?? item.guid;
        const image: string | undefined = item._embedded?.['wp:featuredmedia']?.[0].source_url ?? undefined;
        const updated: number | string = item.modified_gmt ?? pubDate;

        const processedItem: DataItem = {
            title,
            description,
            pubDate: pubDate ? parseDate(pubDate) : undefined,
            link: linkUrl ?? guid,
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

        return processedItem;
    });

    const title: string = $('title').text();

    return {
        title,
        description: $('meta[name="description"]').attr('content'),
        link: targetUrl,
        item: items,
        allowEmpty: true,
        image: $('header#header-div img').attr('src'),
        author: title.split(/-/).pop(),
        language,
        id: targetUrl,
    };
};

export const route: Route = {
    path: '/60s/:category?',
    name: '每日新闻',
    url: '60s.aa1.cn',
    maintainers: ['nczitzk'],
    handler,
    example: '/aa1/60s/news',
    parameters: {
        category: {
            description: '分类，默认为全部，可在对应分类页 URL 中找到',
            options: [
                {
                    label: '全部',
                    value: '',
                },
                {
                    label: '新闻词文章数据',
                    value: 'freenewsdata',
                },
                {
                    label: '最新',
                    value: 'new',
                },
                {
                    label: '本平台同款自动发文章插件',
                    value: '1',
                },
                {
                    label: '每天60秒读懂世界',
                    value: 'news',
                },
            ],
        },
    },
    description: `::: tip
订阅 [每天60秒读懂世界](https://60s.aa1.cn/category/news)，其源网址为 \`https://60s.aa1.cn/category/news\`，请参考该 URL 指定部分构成参数，此时路由为 [\`/aa1/60s/news\`](https://rsshub.app/aa1/60s/news) 或 [\`/aa1/60s/每天60秒读懂世界\`](https://rsshub.app/aa1/60s/每天60秒读懂世界)。
:::

| 分类                                                       | ID                                                      |
| ---------------------------------------------------------- | ------------------------------------------------------- |
| [全部](https://60s.aa1.cn)                                 | [<空>](https://rsshub.app/aa1/60s)                      |
| [新闻词文章数据](https://60s.aa1.cn/category/freenewsdata) | [freenewsdata](https://rsshub.app/aa1/60s/freenewsdata) |
| [最新](https://60s.aa1.cn/category/new)                    | [new](https://rsshub.app/aa1/60s/new)                   |
| [本平台同款自动发文章插件](https://60s.aa1.cn/category/1)  | [1](https://rsshub.app/aa1/60s/1)                       |
| [每天 60 秒读懂世界](https://60s.aa1.cn/category/news)     | [news](https://rsshub.app/aa1/60s/news)                 |
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
            source: ['60s.aa1.cn', '60s.aa1.cn/category/:category'],
            target: '/60s/:category',
        },
        {
            title: '全部',
            source: ['60s.aa1.cn'],
            target: '/60s',
        },
        {
            title: '新闻词文章数据',
            source: ['60s.aa1.cn/category/freenewsdata'],
            target: '/60s/freenewsdata',
        },
        {
            title: '最新',
            source: ['60s.aa1.cn/category/new'],
            target: '/60s/new',
        },
        {
            title: '本平台同款自动发文章插件',
            source: ['60s.aa1.cn/category/1'],
            target: '/60s/1',
        },
        {
            title: '每天60秒读懂世界',
            source: ['60s.aa1.cn/category/news'],
            target: '/60s/news',
        },
    ],
    view: ViewType.Articles,
};
