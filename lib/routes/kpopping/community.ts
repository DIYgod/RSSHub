import type { Context } from 'hono';

import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { renderDescription } from './templates/description';

export const handler = async (ctx: Context): Promise<Data> => {
    const offset = ctx.req.query('offset') ?? '';
    const sort = ctx.req.query('sort') ?? '';
    const gender = ctx.req.query('gender') ?? '';
    const entityType = ctx.req.query('entityType') ?? '';
    const category = ctx.req.query('category') ?? '';
    const idolId = ctx.req.query('idolId');
    const groupId = ctx.req.query('groupId');

    const apiUrl = new URL('https://kpopping.com/api/articles');
    apiUrl.searchParams.set('offset', offset);
    apiUrl.searchParams.set('sort', sort);
    apiUrl.searchParams.set('gender', gender);
    apiUrl.searchParams.set('entityType', entityType);
    apiUrl.searchParams.set('category', category);

    if (idolId) {
        apiUrl.searchParams.set('idolId', idolId);
    } else if (groupId) {
        apiUrl.searchParams.set('groupId', groupId);
    }

    const response = await ofetch(apiUrl.href);
    const articles = response.articles || [];

    const items: DataItem[] = articles.map((item: any) => {
        const title: string = item.title;
        const description = renderDescription({
            images: item.coverImage ? [{ src: item.coverImage, alt: title }] : undefined,
            description: item.excerpt,
        });
        const link = `https://kpopping.com/community/${item.slug}`;
        const pubDate = item.publishedAt ? parseDate(item.publishedAt) : item.createdAt ? parseDate(item.createdAt) : undefined;
        const category = item.category || undefined;
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
        allowEmpty: true,
        language: 'en',
    };
};

export const route: Route = {
    path: '/community',
    name: 'Community',
    url: 'kpopping.com',
    maintainers: ['nczitzk', 'pinapelz'],
    handler,
    example: '/kpopping/community?category=news&idolId=7d8f48d4-97c4-4164-9f04-11febc9c8ac1',
    parameters: {},
    description: `::: tip
Query community posts using query parameters found on kpopping such as \`idolId\`, \`groupId\`, \`gender\`, \`category\`, \`sort\`, etc.
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
        path: '/community',
        name: 'Community',
        url: 'kpopping.com',
        maintainers: ['nczitzk', 'pinapelz'],
        handler,
        example: '/kpopping/community?category=news&idolId=7d8f48d4-97c4-4164-9f04-11febc9c8ac1',
        parameters: {},
        description: `::: tip
支持通过 \`idolId\`、\`groupId\`、\`gender\`、\`category\`、\`sort\` 等查询参数获取新闻。
:::`,
    },
};
