import { ViewType, type Data, type Route } from '@/types';
import type { Context } from 'hono';
import ofetch from '@/utils/ofetch';
import type { FeedSubscription, FollowResponse, InboxSubscription, ListSubscription, Profile, Subscription } from './types';
import { parse } from 'tldts';

export const route: Route = {
    name: 'User subscriptions',
    categories: ['social-media'],
    path: '/profile/:uid',
    example: '/follow/profile/41279032429549568',
    parameters: {
        uid: 'User ID or user handle',
    },
    radar: [
        {
            source: ['app.follow.is/profile/:uid'],
            target: '/profile/:uid',
        },
    ],
    handler,
    maintainers: ['KarasuShin', 'DIYgod', 'DFobain'],
    features: {
        supportRadar: true,
    },
    view: ViewType.Notifications,
};

const isList = (subscription: Subscription): subscription is ListSubscription => 'lists' in subscription;

const isInbox = (subscription: Subscription): subscription is InboxSubscription => 'inboxId' in subscription;

const isFeed = (subscription: Subscription): subscription is FeedSubscription => 'feeds' in subscription;

async function handler(ctx: Context): Promise<Data> {
    const handleOrId = ctx.req.param('uid');
    const host = 'https://api.follow.is';

    const handle = isBizId(handleOrId || '') ? handleOrId : handleOrId.startsWith('@') ? handleOrId.slice(1) : handleOrId;

    const searchParams = new URLSearchParams({ handle });

    if (isBizId(handle || '')) {
        searchParams.append('id', handle);
    }

    const profile = await ofetch<FollowResponse<Profile>>(`${host}/profiles?${searchParams.toString()}`);
    const subscriptions = await ofetch<FollowResponse<Subscription[]>>(`${host}/subscriptions?userId=${profile.data.id}`);

    return {
        title: `${profile.data.name}'s subscriptions`,
        item: (<Exclude<Subscription, InboxSubscription>[]>subscriptions.data.filter((i) => !isInbox(i) && !(isFeed(i) && !!i.feeds.errorAt))).map((subscription) => {
            if (isList(subscription)) {
                return {
                    title: subscription.lists.title,
                    description: subscription.lists.description,
                    link: `https://app.follow.is/list/${subscription.listId}`,
                    image: subscription.lists.image,
                };
            }
            return {
                title: subscription.feeds.title,
                description: subscription.feeds.description,
                link: `https://app.follow.is/feed/${subscription.feedId}`,
                image: getUrlIcon(subscription.feeds.siteUrl).src,
                category: subscription.category ? [subscription.category] : undefined,
            };
        }),
        link: `https://app.follow.is/share/users/${handleOrId}`,
        image: profile.data.image,
    };
}

const getUrlIcon = (url: string, fallback?: boolean | undefined) => {
    let src: string;
    let fallbackUrl = '';

    try {
        const { host } = new URL(url);
        const pureDomain = parse(host).domainWithoutSuffix;
        fallbackUrl = `https://avatar.vercel.sh/${pureDomain}.svg?text=${pureDomain?.slice(0, 2).toUpperCase()}`;
        src = `https://unavatar.follow.is/${host}?fallback=${fallback || false}`;
    } catch {
        const pureDomain = parse(url).domainWithoutSuffix;
        src = `https://avatar.vercel.sh/${pureDomain}.svg?text=${pureDomain?.slice(0, 2).toUpperCase()}`;
    }
    const ret = {
        src,
        fallbackUrl,
    };

    return ret;
};

// referenced from https://github.com/RSSNext/Follow/blob/dev/packages/utils/src/utils.ts
const EPOCH = 1_712_546_615_000n; // follow repo created
const MAX_TIMESTAMP_BITS = 41n; // Maximum number of bits typically used for timestamp
export const isBizId = (id: string): boolean => {
    if (!id || !/^\d{13,19}$/.test(id)) {
        return false;
    }

    const snowflake = BigInt(id);

    // Extract the timestamp assuming it's in the most significant bits after the sign bit
    const timestamp = (snowflake >> (63n - MAX_TIMESTAMP_BITS)) + EPOCH;
    const date = new Date(Number(timestamp));

    // Check if the date is reasonable (between 2024 and 2050)
    if (date.getFullYear() >= 2024 && date.getFullYear() <= 2050) {
        // Additional validation: check if the ID is not larger than the maximum possible value
        const maxPossibleId = (1n << 63n) - 1n; // Maximum possible 63-bit value
        if (snowflake <= maxPossibleId) {
            return true;
        }
    }

    return false;
};
