import { load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseRelativeDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/posts/:channel?',
    categories: ['social-media'],
    example: '/teamblind/posts/tech',
    parameters: { channel: 'Channel slug from /channels/:channel. Omit for the popular homepage feed.' },
    name: 'Popular and channel posts',
    maintainers: ['DIYgod'],
    radar: [
        { source: ['teamblind.com/channels/:channel'], target: '/posts/:channel' },
        { source: ['teamblind.com'], target: '/posts' },
    ],
    handler,
};

function findPosts(value) {
    if (!value || typeof value !== 'object') {
        return;
    }
    if (value.initialData?.articleList) {
        return value.initialData.articleList;
    }
    for (const child of Object.values(value)) {
        const posts = findPosts(child);
        if (posts) {
            return posts;
        }
    }
}

async function handler(ctx) {
    const channel = ctx.req.param('channel');
    if (channel && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(channel)) {
        throw new InvalidParameterError('Use the channel slug shown in the Blind /channels/ URL.');
    }
    const link = `https://www.teamblind.com/${channel ? `channels/${channel}` : ''}`;
    const response = await ofetch(link);
    const $ = load(response);
    const flight = $('script')
        .toArray()
        .flatMap((element) => {
            const match = $(element)
                .text()
                .match(/self\.__next_f\.push\((.+)\)/s);
            if (!match) {
                return [];
            }
            const chunk = JSON.parse(match[1]);
            return chunk[0] === 1 && typeof chunk[1] === 'string' ? [chunk[1]] : [];
        })
        .join('');
    const rows = flight.split('\n').flatMap((line) => {
        const match = line.match(/^[0-9a-f]+:(\[.*|\{.*)$/);
        return match ? [JSON.parse(match[1])] : [];
    });
    const posts = findPosts(rows);
    if (!posts?.length) {
        throw new Error('Blind did not return public posts for this channel. Check its current channel URL.');
    }
    const links = $('a[href^="/post/"]')
        .toArray()
        .map((element) => $(element).attr('href')!);
    return {
        title: `Blind - ${channel ?? 'Popular'} posts`,
        link,
        item: posts
            .map((post) => {
                const href = links.find((url) => url.endsWith(`-${post.alias}`));
                return {
                    title: post.title,
                    link: href ? new URL(href, link).href : undefined,
                    author: post.memberNickname,
                    category: [post.boardName],
                    pubDate: /^(?:\d+[mhd]|Yesterday)$/i.test(post.createdAt) ? parseRelativeDate(post.createdAt === 'Yesterday' ? post.createdAt : `${post.createdAt} ago`) : undefined,
                    description: renderToString(<p>{post.content}</p>),
                };
            })
            .filter((item) => item.link),
    };
}
