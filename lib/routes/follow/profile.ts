import type { Data, Route } from '@/types';
import type { Context } from 'hono';
import ofetch from '@/utils/ofetch';
import type { FollowResponse, Profile, Subscription } from './types';

export const route: Route = {
    name: 'User subscriptions',
    path: '/profile/:uid',
    example: '/profile/41279032429549568',
    radar: [
        {
            source: ['app.follow.is/profile/:uid'],
            target: '/profile/:uid',
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
        title: `${profile.data.name} - User subscriptions`,
        item: subscriptions.data.map((subscription) => ({
            title: subscription.feeds.title,
            description: subscription.feeds.description,
            link: `https://app.follow.is/feed/${subscription.feedId}`,
        })),
        link: `https://app.follow.is/profile/${uid}`,
        image: profile.data.image,
    };
}
