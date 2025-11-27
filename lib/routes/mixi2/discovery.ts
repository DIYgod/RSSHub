import type { Context } from 'hono';

import { type Data, type Route, ViewType } from '@/types';

import { CONFIG_OPTIONS, generatePostDataItem, getClient, postFilter } from './utils';

const handler = async (ctx: Context) => {
    const limit = Number.parseInt(ctx.req.query('limit') ?? '20', 10);

    const client = getClient();

    const data = await client.getRecommendedTimeline({
        limit,
    });

    const personasData = await client.getPersonas({
        personaIds: data?.posts?.map((post) => post.personaId) ?? [],
    });

    return {
        title: '発見',
        link: 'https://mixi.social/home/discovery',
        image: 'https://mixi.social/_next/static/media/image_logo.8bb36f11.svg',
        item:
            data?.posts?.filter(postFilter).map((post) => {
                const author = personasData.personas.find((persona) => persona.personaId === post.personaId);
                return {
                    title: `@${author?.name}`,
                    ...generatePostDataItem(post, personasData.personas),
                };
            }) ?? [],
    } as Data;
};

export const route: Route = {
    path: '/discovery',
    name: '発見',
    categories: ['social-media'],
    example: '/mixi2/discovery',
    features: {
        supportRadar: true,
        requireConfig: CONFIG_OPTIONS,
    },
    radar: [
        {
            source: ['mixi.social/home/discovery'],
            target: '/discovery',
            title: '発見',
        },
    ],
    view: ViewType.SocialMedia,
    handler,
    maintainers: ['KarasuShin'],
};
