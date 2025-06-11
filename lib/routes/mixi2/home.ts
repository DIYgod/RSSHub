import { Data, Route } from '@/types';
import type { Context } from 'hono';
import { CONFIG_OPTIONS, getClient, parsePost } from './utils';
import { parseDate } from '@/utils/parse-date';

const handler = async (ctx: Context) => {
    const limit = Number.parseInt(ctx.req.query('limit') ?? '20', 10);

    const client = getClient();

    const data = await client.getSubscribingFeeds({
        limit,
    });

    return {
        title: 'フォロー中',
        image: 'https://mixi.social/_next/static/media/image_logo.8bb36f11.svg',
        item:
            data?.feeds
                ?.filter((feed) => !feed.post.isDeleted)
                .map((feed) => ({
                    description: parsePost(feed.post),
                    pubDate: parseDate(feed.post.createdAt.seconds * 1e3),
                    guid: feed.post.postId,
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
    handler,
    maintainers: ['KarasuShin'],
};
