import { Route, ViewType } from '@/types';

import cache from '@/utils/cache';
import { parseDate } from '@/utils/parse-date';
import { resolveHandle, getFeed, getFeedGenerator } from './utils';
import { art } from '@/utils/render';
import path from 'node:path';

export const route: Route = {
    path: '/profile/:handle/feed/:space/:routeParams?',
    categories: ['social-media', 'popular'],
    view: ViewType.SocialMedia,
    example: '/bsky.app/profile/jaz.bsky.social/feed/cv:cat',
    parameters: {
        handle: 'User handle, can be found in URL',
        space: 'Space ID, can be found in URL',
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Feeds',
    maintainers: ['FerrisChi'],
    handler,
};

async function handler(ctx) {
    const handle = ctx.req.param('handle');
    const space = ctx.req.param('space');

    const DID = await resolveHandle(handle, cache.tryGet);
    const uri = `at://${DID}/app.bsky.feed.generator/${space}`;
    const profile = await getFeedGenerator(uri, cache.tryGet);
    const feeds = await getFeed(uri, cache.tryGet);

    const items = feeds.feed.map(({ post }) => ({
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
        feeds,
    });

    return {
        title: `${profile.view.displayName} — Bluesky`,
        description: profile.view.description?.replaceAll('\n', ' '),
        link: `https://bsky.app/profile/${handle}/feed/${space}`,
        image: profile.view.avatar,
        icon: profile.view.avatar,
        logo: profile.view.avatar,
        item: items,
        allowEmpty: true,
    };
}
