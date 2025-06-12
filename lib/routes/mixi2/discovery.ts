import { Data, Route } from '@/types';
import type { Context } from 'hono';
import { CONFIG_OPTIONS, getClient, parsePost } from './utils';
import { parseDate } from '@/utils/parse-date';

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
        item:
            data?.posts?.map((post) => ({
                title: `@${personasData.personas.find((persona) => persona.personaId === post.personaId)?.name}`,
                description: parsePost(post),
                pubDate: parseDate(post.createdAt.seconds * 1e3),
                guid: post.postId,
            })) ?? [],
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
    handler,
    maintainers: ['KarasuShin'],
};
