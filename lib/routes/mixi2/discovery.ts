import type { Context } from 'hono';

import type { Data, Route } from '@/types';
import { ViewType } from '@/types';
import { getRouteLimit } from '@/utils/route-limit';

import { CONFIG_OPTIONS, generatePostDataItem, getClient, postFilter } from './utils';

const handler = async (ctx: Context): Promise<Data> => {
    const limit = getRouteLimit(ctx, 20);

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
        image: 'https://mixi.social/favicon/favicon-32x32.png',
        item:
            data?.posts?.filter(postFilter).map((post) => {
                const author = personasData.personas.find((persona) => persona.personaId === post.personaId);
                return {
                    title: `@${author?.name}`,
                    ...generatePostDataItem(post, personasData.personas),
                };
            }) ?? [],
    };
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
