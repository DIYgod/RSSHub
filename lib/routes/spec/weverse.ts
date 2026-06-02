import type { Context } from 'hono';

import type { Data, DataItem, Route } from '@/types';
import type { SpecExtraWeverse } from '@/types/spec-extra';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { assertEnv, buildCacheKey, throwAuthError } from './utils';

const WEVERSE_API = 'https://weverse.io/api/v2';

type WeversePostType = 'ARTIST' | 'FAN' | 'MEDIA' | 'MOMENT';

interface WeversePost {
    postId: string;
    postType: WeversePostType;
    communityId: number;
    publishedAt?: string;
    body?: string;
    thumbnail?: { url?: string };
    extension?: { isPaid?: boolean };
    artist?: { profileImageUrl?: string; name?: string };
    community?: { name?: string };
}

interface WeverseFeedResponse {
    data?: WeversePost[];
}

function postTypeLabel(raw: WeversePostType): SpecExtraWeverse['postType'] {
    const map: Record<WeversePostType, SpecExtraWeverse['postType']> = {
        ARTIST: 'artist',
        FAN: 'fan',
        MEDIA: 'media',
        MOMENT: 'moment',
    };
    return map[raw] ?? 'artist';
}

function postTypeKind(label: SpecExtraWeverse['postType']): SpecExtraWeverse['type'] {
    if (label === 'media') {
        return 'weverse/media';
    }
    if (label === 'moment') {
        return 'weverse/moment';
    }
    return 'weverse/post';
}

async function fetchFeed(communityId: string, token: string): Promise<WeverseFeedResponse> {
    try {
        return (await ofetch(`${WEVERSE_API}/post/v1.0/community-${communityId}/feedList`, {
            query: {
                fieldSet: 'postForFeed',
                offset: 0,
                limit: 20,
                sortType: 'LATEST',
            },
            headers: { Authorization: `Bearer ${token}` },
        })) as WeverseFeedResponse;
    } catch (error: any) {
        if (error?.response?.status === 401 || error?.response?.status === 403) {
            throwAuthError('ERR_WEVERSE_TOKEN_EXPIRED', 'WEVERSE_TOKEN has expired. Renew via DevTools and redeploy.');
        }
        throw error;
    }
}

export const route: Route = {
    path: '/weverse/:artistId',
    categories: ['social-media'],
    example: '/spec/weverse/46',
    parameters: {
        artistId: 'Weverse community (artist) ID — numeric. Find via the Weverse DevTools network tab on a community page.',
    },
    features: {
        requireConfig: [
            {
                name: 'WEVERSE_TOKEN',
                optional: false,
                description: 'Bearer token from an authenticated Weverse session. Obtain via DevTools → Network → Authorization header on a weverse.io/api/v2 request.',
            },
        ],
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        supportRadar: true,
    },
    url: 'weverse.io',
    name: 'Artist Community Feed',
    maintainers: ['koreanpatch'],
    radar: [
        {
            source: ['weverse.io/:artistSlug', 'weverse.io/:artistSlug/feed'],
            target: '/spec/weverse/:artistId',
        },
    ],
    handler,
};

async function handler(ctx: Context): Promise<Data> {
    const artistId = ctx.req.param('artistId');
    const token = assertEnv('WEVERSE_TOKEN', 'ERR_WEVERSE_TOKEN_MISSING');

    const feed = await cache.tryGet(buildCacheKey('weverse', artistId), () => fetchFeed(artistId, token), 3 * 60);

    const posts: WeversePost[] = feed.data ?? [];
    const communityName = posts[0]?.community?.name ?? `Community ${artistId}`;

    const items: DataItem[] = posts.map((post) => {
        const link = `https://weverse.io/community/${artistId}/post/${post.postId}`;
        const isPaid = post.extension?.isPaid ?? false;
        const thumb = post.thumbnail?.url ?? post.artist?.profileImageUrl ?? '';
        const pubDate = parseDate(post.publishedAt ?? '');
        const postTypeNorm = postTypeLabel(post.postType);
        const extraType = postTypeKind(postTypeNorm);

        const extra: SpecExtraWeverse = {
            type: extraType,
            platform: 'weverse',
            sourceUrl: link,
            externalId: post.postId,
            seriesExternalId: String(artistId),
            publishedAt: pubDate ? pubDate.toISOString() : undefined,
            artistId: String(artistId),
            communityId: String(post.communityId),
            postType: postTypeNorm,
            isPaid,
        };

        const displayTitle = post.body?.slice(0, 80) ?? (isPaid ? '[Paid] Weverse post' : 'Weverse post');
        return {
            title: `${communityName} — ${displayTitle}${post.body && post.body.length > 80 ? '…' : ''}`,
            link,
            guid: `spec-weverse-${artistId}-${post.postId}`,
            pubDate,
            author: post.artist?.name,
            image: thumb || undefined,
            description: [thumb ? `<img src="${thumb}" />` : '', post.body ? `<p>${post.body}</p>` : ''].filter(Boolean).join('\n'),
            _extra: extra,
        };
    });

    return {
        title: `${communityName} — Weverse`,
        link: `https://weverse.io/community/${artistId}`,
        item: items,
        language: 'ko',
    };
}
