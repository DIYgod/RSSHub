import type { CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Route } from '@/types';
import { ViewType } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { buildContent, parseRouteOptions, profileUrl, threadUrl } from './utils';

export const route: Route = {
    path: '/:user/post/:id/:routeParams?',
    categories: ['social-media'],
    view: ViewType.SocialMedia,
    example: '/threads/@zuck/post/Ddt7cL5EfUG',
    parameters: {
        user: 'Username',
        id: 'Post ID, the last segment of the post URL',
        routeParams: 'Extra parameters, in the format of query string. Accepts the same options as User timeline',
    },
    radar: [
        {
            source: ['www.threads.com/:user/post/:id'],
            target: '/:user/post/:id',
        },
    ],
    name: 'Post & Replies',
    maintainers: ['TonyRL'],
    handler,
};

const findNodes = (node, predicate: (node) => boolean, acc: any[] = []): any[] => {
    if (node instanceof Object) {
        if (predicate(node)) {
            acc.push(node);
        }
        for (const value of Object.values(node)) {
            findNodes(value, predicate, acc);
        }
    }
    return acc;
};

const extractRelayNodes = ($: CheerioAPI, predicate: (node) => boolean): any[] =>
    $('script[data-sjs]:contains("RelayPrefetchedStreamCache")')
        .toArray()
        .flatMap((script) => findNodes(JSON.parse($(script).text()), predicate));

async function handler(ctx: Context) {
    const { user: rawUser, id, routeParams } = ctx.req.param();
    const user = rawUser.startsWith('@') ? rawUser.slice(1) : rawUser;
    const options = parseRouteOptions(new URLSearchParams(routeParams));
    const link = `${profileUrl(user)}/post/${id}`;

    const response = await ofetch(link);
    const $ = load(response);

    const [post] = extractRelayNodes($, (node) => node.code === id && node.taken_at);
    if (!post) {
        throw new Error('Failed to fetch post data');
    }
    const replies = extractRelayNodes($, (node) => node.direct_replies).flatMap((node) => node.direct_replies.edges.flatMap((thread) => thread.node.posts.edges.map((edge) => edge.node)));

    const items = [post, ...replies].map((post) => {
        const { title, description } = buildContent({ post }, options);
        return {
            author: post.user?.username,
            title,
            description,
            pubDate: parseDate(post.taken_at, 'X'),
            link: threadUrl(post.code),
        };
    });

    return {
        title: `@${post.user?.username}: ${post.caption?.text.split('\n', 1)[0] ?? ''}`,
        link,
        image: post.user?.profile_pic_url,
        item: items,
    };
}
