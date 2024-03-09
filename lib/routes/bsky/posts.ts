import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import { parseDate } from '@/utils/parse-date';
import { resolveHandle, getProfile, getAuthorFeed } from './utils';
import { art } from '@/utils/render';
import * as path from 'node:path';

export default async (ctx) => {
    const handle = ctx.req.param('handle');
    const DID = await resolveHandle(handle, cache.tryGet);
    const profile = await getProfile(DID, cache.tryGet);
    const authorFeed = await getAuthorFeed(DID, cache.tryGet);

    const items = authorFeed.feed.map(({ post }) => ({
        title: post.record.text.split('\n')[0],
        description: art(path.join(__dirname, 'templates/post.art'), {
            text: post.record.text.replaceAll('\n', '<br>'),
            embed: post.embed,
            // embed.$type "app.bsky.embed.record#view" and "app.bsky.embed.recordWithMedia#view"
            // are not handled
        }),
        author: post.author.displayName,
        pubDate: parseDate(post.record.createdAt),
        link: `https://bsky.app/profile/${post.author.handle}/post/${post.uri.split('app.bsky.feed.post/')[1]}`,
        upvotes: post.likeCount,
        comments: post.replyCount,
    }));

    ctx.set('data', {
        title: `${profile.displayName} (@${profile.handle}) — Bluesky`,
        description: profile.description?.replaceAll('\n', ' '),
        link: `https://bsky.app/profile/${profile.handle}`,
        image: profile.banner,
        icon: profile.avatar,
        logo: profile.avatar,
        item: items,
    });

    ctx.set('json', {
        DID,
        profile,
        authorFeed,
    });
};
