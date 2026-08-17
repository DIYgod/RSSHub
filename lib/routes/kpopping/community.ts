import type { Context } from 'hono';

import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { renderDescription } from './templates/description';

export const handler = async (ctx: Context): Promise<Data> => {
    const filter = ctx.req.param('filter');
    const params = new URLSearchParams(filter);

    const apiUrl = new URL('https://kpopping.com/api/articles');
    apiUrl.search = params.toString();

    const response = await ofetch(apiUrl.href);
    const articles = response.articles || [];

    const items: DataItem[] = articles.map((item: any) => {
        const title: string = item.title;
        const description = renderDescription({
            images: item.coverImage ? [{ src: item.coverImage, alt: title }] : undefined,
            description: item.excerpt,
        });
        const link = `https://kpopping.com/community/${item.slug}`;
        const dateStr = item.publishedAt ?? item.createdAt;
        const pubDate = dateStr ? parseDate(dateStr) : undefined;
        const category = item.category;
        const author = item.authorName;

        return {
            title,
            description,
            link,
            pubDate,
            category,
            author,
            content: {
                html: description,
                text: description,
            },
            image: item.coverImage,
            banner: item.coverImage,
        };
    });

    return {
        title: 'Community - kpopping',
        link: 'https://kpopping.com/community',
        item: items,
        language: 'en',
    };
};

export const route: Route = {
    path: '/community/:filter{.+}?',
    name: 'Community',
    url: 'kpopping.com',
    maintainers: ['nczitzk', 'pinapelz'],
    handler,
    example: '/kpopping/community/category=news&idolId=7d8f48d4-97c4-4164-9f04-11febc9c8ac1',
    parameters: {
        filter: 'Filter parameters in `key=value&key2=value2` format. Supported keys: `category`, `gender`, `sort`, `entityType`, `idolId`, `groupId`',
    },
    description: `::: tip
Query community posts using filter parameters found on kpopping such as \`idolId\`, \`groupId\`, \`gender\`, \`category\`, \`sort\`, etc.
:::`,
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
            source: ['kpopping.com/community'],
            target: '/community',
        },
    ],
    view: ViewType.Articles,

    zh: {
        path: '/community/:filter{.+}?',
        name: 'Community',
        url: 'kpopping.com',
        maintainers: ['nczitzk', 'pinapelz'],
        handler,
        example: '/kpopping/community/category=news&idolId=7d8f48d4-97c4-4164-9f04-11febc9c8ac1',
        parameters: {
            filter: '以 `key=value&key2=value2` 格式传递的过滤参数。支持的 key 包括 `category`、`gender`、`sort`、`entityType`、`idolId`、`groupId`',
        },
        description: `::: tip
支持通过 \`idolId\`、\`groupId\`、\`gender\`、\`category\`、\`sort\` 等过滤条件获取新闻与社区帖子。
:::`,
    },
};
