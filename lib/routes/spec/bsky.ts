import type { Context } from 'hono';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Data, DataItem, Route } from '@/types';
import type { SpecExtraBsky } from '@/types/spec-extra';
import cache from '@/utils/cache';
import { parseDate } from '@/utils/parse-date';

import { renderPost } from '../bsky/templates/post';
import { getAuthorFeed, getProfile, resolveHandle } from '../bsky/utils';

const DEFAULT_FILTER = 'posts_and_author_threads';

export const route: Route = {
    path: '/bsky/:handle',
    categories: ['social-media'],
    example: '/spec/bsky/bsky.app',
    parameters: {
        handle: 'Bluesky handle (e.g. bsky.app). Found in the profile URL: bsky.app/profile/:handle',
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        supportRadar: true,
    },
    url: 'bsky.app',
    name: 'Bluesky Posts',
    maintainers: ['koreanpatch'],
    radar: [
        {
            source: ['bsky.app/profile/:handle'],
            target: '/spec/bsky/:handle',
        },
    ],
    handler,
};

function postRkey(uri: string): string {
    const parts = uri.split('app.bsky.feed.post/');
    return parts[1] ?? uri;
}

async function handler(ctx: Context): Promise<Data> {
    const handle = ctx.req.param('handle')?.trim();

    if (!handle || !/^[\w.-]+$/.test(handle)) {
        throw new InvalidParameterError('Invalid Bluesky handle. Use the handle from bsky.app/profile/:handle.');
    }

    const did = (await resolveHandle(handle, cache.tryGet)) as string;
    const profile = await getProfile(did, cache.tryGet);
    const authorFeed = await getAuthorFeed(did, DEFAULT_FILTER, cache.tryGet);

    const profileHandle = String(profile.handle ?? handle);

    const items: DataItem[] = (authorFeed.feed ?? []).map(({ post }) => {
        const text = String(post.record?.text ?? '');
        const rkey = postRkey(String(post.uri));
        const authorHandle = String(post.author?.handle ?? profileHandle);
        const authorDid = String(post.author?.did ?? did);
        const link = `https://bsky.app/profile/${authorHandle}/post/${rkey}`;
        const pubDate = parseDate(post.record?.createdAt);

        const extra: SpecExtraBsky = {
            type: 'bsky/post',
            platform: 'bluesky',
            sourceUrl: link,
            externalId: rkey,
            seriesExternalId: authorHandle,
            publishedAt: pubDate ? pubDate.toISOString() : undefined,
            handle: authorHandle,
            did: authorDid,
            rkey,
        };

        return {
            title: text.split('\n', 1)[0] || rkey,
            description: renderPost({
                text: text.replaceAll('\n', '<br>'),
                embed: post.embed,
            }),
            author: post.author?.displayName ?? authorHandle,
            pubDate,
            link,
            guid: `spec-bsky-${authorDid}-${rkey}`,
            upvotes: post.likeCount,
            comments: post.replyCount,
            _extra: extra,
        };
    });

    return {
        title: `${profile.displayName ?? profileHandle} (@${profileHandle}) — Bluesky`,
        description: profile.description?.replaceAll('\n', ' '),
        link: `https://bsky.app/profile/${profileHandle}`,
        image: profile.avatar,
        icon: profile.avatar,
        logo: profile.avatar,
        item: items,
        allowEmpty: true,
    };
}
