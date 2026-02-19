import dayjs from 'dayjs';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

import { baseUrl, fetchUserDate } from './utils';

const renderDescription = (postMeta, postDate, posts) =>
    renderToString(
        <>
            {postMeta.visit_amount}阅读 {postMeta.note_amount}条笔记 创建于{postDate}
            <br />
            {posts.map((post) => (
                <>
                    {(post.struct?.items ?? []).map((item) => {
                        if (item.type === 'text' || item.type === 'link') {
                            return <span>{raw((item.content ?? '').replaceAll('\n', '<br>'))}</span>;
                        }
                        if (item.type === 'url') {
                            return <a href={item.url}>{item.content}</a>;
                        }
                        return null;
                    })}
                    <br />
                    {dayjs(post.publish_time_timestamp, 'X').format('YYYY-MM-DD HH:mm:ss')}
                    <hr />
                </>
            ))}
        </>
    );

export const route: Route = {
    path: '/posts/:author',
    categories: ['new-media'],
    example: '/zhiy/posts/long',
    parameters: { author: '作者 ID，可在URL中找到' },
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
            source: ['zhiy.cc/:author'],
        },
    ],
    name: '笔记',
    maintainers: ['TonyRL'],
    handler,
};

async function handler(ctx) {
    const author = ctx.req.param('author');

    const userData = await fetchUserDate(author);
    const { author_id: authorId, author_name: authorName, author_signature: authorSignature, author_avatar_url: authorAvatarUrl } = userData;

    const {
        data: { result: posts },
    } = await got(`${baseUrl}/api/app/share/garden/users/${authorId}/posts`, {
        searchParams: {
            page: 1,
            limit: ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 100,
        },
    });

    const list = posts.map((item) => ({
        title: item.title,
        pubDate: parseDate(item.create_time, 'X'),
        link: `${baseUrl}/b${item.share_md5}`,
        guid: `${baseUrl}/b${item.share_md5}:${item.link_amount}:${item.note_amount}`,
        postId: item.id,
        shareMD5: item.share_md5,
    }));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: postMeta } = await got(`${baseUrl}/api/app/share/posts/${item.shareMD5}`);

                const {
                    data: { result: posts },
                } = await got(`${baseUrl}/api/app/share/posts/${item.postId}/notes`, {
                    searchParams: {
                        page: 1,
                        limit: 100,
                    },
                });

                item.description = renderDescription(postMeta, dayjs(postMeta.create_time, 'X').format('YYYY-MM-DD HH:mm:ss'), posts);

                return item;
            })
        )
    );

    return {
        title: authorName,
        link: `${baseUrl}/${author}`,
        description: authorSignature,
        image: authorAvatarUrl,
        item: items,
    };
}
