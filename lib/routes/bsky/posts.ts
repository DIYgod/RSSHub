import { Route, ViewType } from '@/types';

import cache from '@/utils/cache';
import { parseDate } from '@/utils/parse-date';
import { resolveHandle, getProfile, getAuthorFeed } from './utils';
import { art } from '@/utils/render';
import path from 'node:path';
import querystring from 'querystring';

export const route: Route = {
    path: '/profile/:handle/:routeParams?',
    categories: ['social-media', 'popular'],
    view: ViewType.SocialMedia,
    example: '/bsky/profile/bsky.app',
    parameters: {
        handle: 'User handle, can be found in URL',
        routeParams: 'Filter parameter, Use filter to customize content types',
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['bsky.app/profile/:handle'],
        },
    ],
    name: 'Post',
    maintainers: ['TonyRL'],
    handler,
    description: `
| Filter Value | Description |
|--------------|-------------|
| posts_with_replies | Includes Posts, Replies, and Reposts |
| posts_no_replies | Includes Posts and Reposts, without Replies |
| posts_with_media | Shows only Posts containing media |
| posts_and_author_threads | Shows Posts and Threads, without Replies and Reposts |

Default value for filter is \`posts_and_author_threads\` if not specified.

Example:
- \`/bsky/profile/bsky.app/filter=posts_with_replies\``,
};

async function handler(ctx) {
    const handle = ctx.req.param('handle');
    const routeParams = querystring.parse(ctx.req.param('routeParams'));
    const filter = routeParams.filter || 'posts_and_author_threads';

    const DID = await resolveHandle(handle, cache.tryGet);
    const profile = await getProfile(DID, cache.tryGet);
    const authorFeed = await getAuthorFeed(DID, filter, cache.tryGet);

    const items = authorFeed.feed.map(({ post }) => ({
        title: post.record.text.split('\n')[0],
        description: art(path.join(__dirname, 'templates/post.art'), {
            text: post.record.text.replaceAll('\n', '<br>'),
            embed: post.embed,
            // embed.$type "app.bsky.embed.record#view" and "app.bsky.embed.recordWithMedia#view" are not handled
        }),
        author: post.author.displayName,
        pubDate: parseDate(post.record.createdAt),
        link: `https://bsky.app/profile/${post.author.handle}/post/${post.uri.split('app.bsky.feed.post/')[1]}`,
        upvotes: post.likeCount,
        comments: post.replyCount,
    }));

    ctx.set('json', {
        DID,
        profile,
        authorFeed,
    });

    return {
        title: `${profile.displayName} (@${profile.handle}) — Bluesky`,
        description: profile.description?.replaceAll('\n', ' '),
        link: `https://bsky.app/profile/${profile.handle}`,
        image: profile.avatar,
        icon: profile.avatar,
        logo: profile.avatar,
        item: items,
        allowEmpty: true,
    };
}
