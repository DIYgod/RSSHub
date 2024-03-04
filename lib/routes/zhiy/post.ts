// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
const { baseUrl, fetchUserDate } = require('./utils');
import { art } from '@/utils/render';
import * as path from 'node:path';
const dayjs = require('dayjs');

export default async (ctx) => {
    art.defaults.imports = {
        dayjs,
        ...art.defaults.imports,
    };

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

                item.description = art(path.join(__dirname, 'templates/post.art'), {
                    postMeta,
                    postDate: dayjs(postMeta.create_time, 'X').format('YYYY-MM-DD HH:mm:ss'),
                    posts,
                });

                return item;
            })
        )
    );

    ctx.set('data', {
        title: authorName,
        link: `${baseUrl}/${author}`,
        description: authorSignature,
        image: authorAvatarUrl,
        item: items,
    });
};
