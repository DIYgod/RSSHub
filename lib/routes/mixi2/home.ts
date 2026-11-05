import type { Context } from 'hono';

import type { Data, Route } from '@/types';
import { ViewType } from '@/types';
import { getRouteLimit } from '@/utils/route-limit';

import { CONFIG_OPTIONS, generatePostDataItem, getClient, postFilter } from './utils';

const handler = async (ctx: Context): Promise<Data> => {
    const limit = getRouteLimit(ctx, 20);

    const client = getClient();

    const data = await client.getSubscribingFeeds({
        limit,
    });

    const personasData = await client.getPersonas({
        personaIds: data?.feeds?.map((feed) => feed.post.personaId) ?? [],
    });

    return {
        title: 'フォロー中',
        link: 'https://mixi.social/home',
        image: 'https://mixi.social/favicon/favicon-32x32.png',
        item:
            data?.feeds
                ?.filter((feed) => postFilter(feed.post))
                .map((feed) => ({
                    title: `@${personasData.personas.find((persona) => persona.personaId === feed.post.personaId)?.name}`,
                    ...generatePostDataItem(feed.post, personasData.personas),
                })) ?? [],
    };
};

export const route: Route = {
    path: '/home',
    name: 'フォロー中',
    categories: ['social-media'],
    example: '/mixi2/home',
    features: {
        requireConfig: CONFIG_OPTIONS,
        supportRadar: true,
    },
    radar: [
        {
            source: ['mixi.social/home'],
            target: '/home',
            title: 'フォロー中',
        },
    ],
    view: ViewType.SocialMedia,
    handler,
    maintainers: ['KarasuShin'],
};
