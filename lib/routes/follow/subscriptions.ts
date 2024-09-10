import type { Data, Route } from '@/types';
import { Context } from 'hono';
import ofetch from '@/utils/ofetch';
import type { FollowResponse, Profile, Subscription } from './types';

export const route: Route = {
    name: '订阅列表',
    path: '/subscriptions/:uid',
    example: '/subscriptions/41279032429549568',
    radar: [
        {
            source: ['app.follow.is/profile/:uid'],
            target: '/follow/subscriptions/:uid',
        },
    ],
    handler,
    maintainers: ['KarasuShin'],
    features: {
        supportRadar: true,
    },
};

async function handler(ctx: Context): Promise<Data> {
    const uid = ctx.req.param('uid');
    const host = 'https://api.follow.is';

    const [profile, subscriptions] = await Promise.all([ofetch<FollowResponse<Profile>>(`${host}/profiles?id=${uid}`), ofetch<FollowResponse<Subscription[]>>(`${host}/subscriptions?userId=${uid}`)]);

    return {
        title: `${profile.data.name} - 订阅列表`,
        item: subscriptions.data.map((subscription) => ({
            title: subscription.feeds.title,
            description: subscription.feeds.description,
            link: `https://app.follow.is/feed/${subscription.feedId}`,
        })),
    };
}
