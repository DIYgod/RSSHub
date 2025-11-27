import type { Context } from 'hono';

import { type Data, type Route, ViewType } from '@/types';

import { CONFIG_OPTIONS, generatePostDataItem, getClient, postFilter } from './utils';

const handler = async (ctx: Context) => {
    const limit = Number.parseInt(ctx.req.query('limit') ?? '20', 10);

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
        image: 'https://mixi.social/_next/static/media/image_logo.8bb36f11.svg',
        item:
            data?.feeds
                ?.filter((feed) => postFilter(feed.post))
                .map((feed) => ({
                    title: `@${personasData.personas.find((persona) => persona.personaId === feed.post.personaId)?.name}`,
                    ...generatePostDataItem(feed.post, personasData.personas),
                })) ?? [],
    } as Data;
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
