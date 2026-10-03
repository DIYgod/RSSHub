import type { Context } from 'hono';

import type { Data, Language, Route } from '@/types';
import ofetch from '@/utils/ofetch';

import { apiUrl, articleElements, mapArticle, siteUrl } from './utils';

export const handler = async (ctx: Context): Promise<Data> => {
    const limit = Number(ctx.req.query('limit') ?? '30');

    const response = await ofetch(apiUrl, {
        query: {
            'system.type': 'article',
            order: 'elements.date[desc]',
            limit,
            elements: articleElements,
        },
    });

    return {
        title: 'Gates Notes',
        description: 'Notes and essays by Bill Gates on the issues he is focused on.',
        link: siteUrl,
        language: 'en' as const satisfies Language,
        icon: `${siteUrl}/favicon.ico`,
        logo: `${siteUrl}/favicon.ico`,
        author: 'Bill Gates',
        item: await Promise.all(response.items.map((item) => mapArticle(item))),
    };
};

export const route: Route = {
    path: '/',
    name: 'Latest Notes',
    url: 'www.gatesnotes.com',
    maintainers: ['wongJG'],
    handler,
    example: '/gatesnotes',
    parameters: {},
    description: 'Subscribe to the latest notes by Bill Gates from [Gates Notes](https://www.gatesnotes.com/).',
    categories: ['blog'],
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
            source: ['www.gatesnotes.com'],
        },
    ],
};
