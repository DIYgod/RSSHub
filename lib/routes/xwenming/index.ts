import { type Data, type DataItem, type Route, ViewType } from '@/types';

import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { type CheerioAPI, load } from 'cheerio';
import { type Context } from 'hono';

export const handler = async (ctx: Context): Promise<Data> => {
    const { category } = ctx.req.param();
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '50', 10);

    const apiSlug = 'wp-json/wp/v2';
    const baseUrl: string = 'https://www.xwenming.com';

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

    const targetUrl: string = new URL(categorySlug ? `index.php/category/${categorySlug}` : '', baseUrl).href;

    const targetResponse = await ofetch(targetUrl);
    const $: CheerioAPI = load(targetResponse);
    const language = $('html').attr('lang') ?? 'zh';

    const items: DataItem[] = response.slice(0, limit).map((item): DataItem => {
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

    return {
        title: $('title').text(),
        description: $('meta[name="description"]').attr('content'),
        link: targetUrl,
        item: items,
        allowEmpty: true,
        image: $('meta[name="msapplication-TileImage"]').attr('content'),
        language,
        id: targetUrl,
    };
};

export const route: Route = {
    path: '/:category?',
    name: '分类',
    url: 'www.xwenming.com',
    maintainers: ['nczitzk'],
    handler,
    example: '/xwenming/news',
    parameters: {
        category: {
            description: '分类，默认为全部，可在对应分类页 URL 中找到',
            options: [
                {
                    label: '全部',
                    value: '',
                },
                {
                    label: '科技前沿',
                    value: 'news',
                },
                {
                    label: '疑难杂症',
                    value: 'solve',
                },
                {
                    label: '通知专栏',
                    value: 'notice',
                },
                {
                    label: '未分类',
                    value: 'uncategorized',
                },
            ],
        },
    },
    description: `:::tip
订阅 [科技前沿](https://www.xwenming.com/index.php/category/news)，其源网址为 \`https://www.xwenming.com/index.php/category/news\`，请参考该 URL 指定部分构成参数，此时路由为 [\`/xwenming/category/news\`](https://rsshub.app/xwenming/category/news) 或 [\`/xwenming/category/科技前沿\`](https://rsshub.app/xwenming/category/科技前沿)。
:::

| 分类                                                                | ID                                                                  |
| ------------------------------------------------------------------- | ------------------------------------------------------------------- |
| [全部](https://www.xwenming.com)                                    | [<空>](https://rsshub.app/xwenming)                                 |
| [科技前沿](https://www.xwenming.com/index.php/category/news)        | [news](https://rsshub.app/xwenming/category/news)                   |
| [疑难杂症](https://www.xwenming.com/index.php/category/solve)       | [solve](https://rsshub.app/xwenming/category/solve)                 |
| [通知专栏](https://www.xwenming.com/index.php/category/notice)      | [notice](https://rsshub.app/xwenming/category/notice)               |
| [未分类](https://www.xwenming.com/index.php/category/uncategorized) | [uncategorized](https://rsshub.app/xwenming/category/uncategorized) |
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
            source: ['www.xwenming.com', 'www.xwenming.com/index.php/category/:category'],
            target: '/:category',
        },
        {
            title: '全部',
            source: ['www.xwenming.com'],
            target: '/',
        },
        {
            title: '科技前沿',
            source: ['www.xwenming.com/index.php/category/news'],
            target: '/news',
        },
        {
            title: '疑难杂症',
            source: ['www.xwenming.com/index.php/category/solve'],
            target: '/solve',
        },
        {
            title: '通知专栏',
            source: ['www.xwenming.com/index.php/category/notice'],
            target: '/notice',
        },
        {
            title: '未分类',
            source: ['www.xwenming.com/index.php/category/uncategorized'],
            target: '/uncategorized',
        },
    ],
    view: ViewType.Articles,
};
