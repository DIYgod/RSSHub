import type { Context } from 'hono';

import type { Data, Language, Route } from '@/types';
import ofetch from '@/utils/ofetch';

import { apiUrl, articleElements, getTaxonomy, mapArticle, siteUrl } from './utils';

export const handler = async (ctx: Context): Promise<Data> => {
    const { topic } = ctx.req.param();
    const limit = Number(ctx.req.query('limit') ?? '30');

    const entry = (await getTaxonomy())[topic.replaceAll('-', '_')];
    if (!entry || (entry.parent !== 'work' && entry.parent !== 'meet_bill')) {
        throw new Error(`Unknown Gates Notes topic "${topic}". Valid topics are listed on ${siteUrl}/work and ${siteUrl}/meet-bill`);
    }

    const response = await ofetch(apiUrl, {
        query: {
            'system.type': 'article',
            'elements.page_taxonomy_set__gn_taxonomy[contains]': topic.replaceAll('-', '_'),
            order: 'elements.date[desc]',
            limit,
            elements: articleElements,
        },
    });

    const section = entry.parent === 'meet_bill' ? 'meet-bill' : 'work';

    return {
        title: `Gates Notes - ${entry.name}`,
        description: 'Notes and essays by Bill Gates from [Gates Notes](https://www.gatesnotes.com/).',
        link: `${siteUrl}/${section}/${topic}`,
        language: 'en' as const satisfies Language,
        icon: `${siteUrl}/favicon.ico`,
        logo: `${siteUrl}/favicon.ico`,
        author: 'Bill Gates',
        item: await Promise.all(response.items.map((item) => mapArticle(item))),
    };
};

export const route: Route = {
    path: '/work/:topic',
    name: 'Topic',
    url: 'www.gatesnotes.com',
    maintainers: ['wongJG'],
    handler,
    example: '/gatesnotes/work/make-ai-work-for-everyone',
    parameters: {
        topic: {
            description: 'Topic, can be found in the URL of the corresponding topic page on Gates Notes, e.g. `make-ai-work-for-everyone`',
        },
    },
    description: 'Subscribe to notes and essays of a specific topic from [Gates Notes](https://www.gatesnotes.com/work).',
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
            source: ['www.gatesnotes.com/work/:topic', 'www.gatesnotes.com/meet-bill/:topic'],
            target: '/work/:topic',
        },
    ],
};
