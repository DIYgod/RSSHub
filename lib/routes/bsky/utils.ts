import { config } from '@/config';
import got from '@/utils/got';

/**
 * docs: https://atproto.com/lexicons/app-bsky
 */

// https://github.com/bluesky-social/atproto/blob/main/lexicons/com/atproto/identity/resolveHandle.json
const resolveHandle = (handle, tryGet) =>
    tryGet(`bsky:${handle}`, async () => {
        const { data } = await got('https://public.api.bsky.app/xrpc/com.atproto.identity.resolveHandle', {
            searchParams: {
                handle,
            },
        });
        return data.did;
    });

// https://github.com/bluesky-social/atproto/blob/main/lexicons/app/bsky/actor/getProfile.json
const getProfile = (did, tryGet) =>
    tryGet(`bsky:profile:${did}`, async () => {
        const { data } = await got('https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile', {
            searchParams: {
                actor: did,
            },
        });
        return data;
    });

// https://github.com/bluesky-social/atproto/blob/main/lexicons/app/bsky/feed/getAuthorFeed.json
const getAuthorFeed = (did, filter, tryGet) =>
    tryGet(
        `bsky:authorFeed:${did}:${filter}`,
        async () => {
            const { data } = await got('https://public.api.bsky.app/xrpc/app.bsky.feed.getAuthorFeed', {
                searchParams: {
                    actor: did,
                    filter,
                    limit: 30,
                },
            });
            return data;
        },
        config.cache.routeExpire,
        false
    );

// https://github.com/bluesky-social/atproto/blob/main/lexicons/app/bsky/feed/getFeed.json
const getFeed = (uri, tryGet) =>
    tryGet(
        `bsky:feed:${uri}`,
        async () => {
            const { data } = await got('https://public.api.bsky.app/xrpc/app.bsky.feed.getFeed', {
                searchParams: {
                    feed: uri,
                    limit: 30,
                },
            });
            return data;
        },
        config.cache.routeExpire,
        false
    );

// https://github.com/bluesky-social/atproto/blob/main/lexicons/app/bsky/feed/getFeedGenerator.json
const getFeedGenerator = (uri, tryGet) =>
    tryGet(
        `bsky:feedGenerator:${uri}`,
        async () => {
            const { data } = await got('https://public.api.bsky.app/xrpc/app.bsky.feed.getFeedGenerator', {
                searchParams: {
                    feed: uri,
                },
            });
            return data;
        },
        config.cache.routeExpire,
        false
    );

export { getAuthorFeed, getFeed, getFeedGenerator, getProfile, resolveHandle };
