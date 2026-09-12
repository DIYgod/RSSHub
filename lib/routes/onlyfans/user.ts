import { createHash, randomBytes } from 'node:crypto';

import type { Context } from 'hono';
import sanitizeHtml from 'sanitize-html';

import { config } from '@/config';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/:username',
    categories: ['social-media'],
    features: {
        requireConfig: [
            {
                name: 'ONLYFANS_COOKIE',
                optional: true,
                description: 'The `Cookie` header of a logged-in session.',
            },
        ],
        nsfw: true,
    },
    example: '/onlyfans/sports',
    parameters: {
        username: 'Creator username',
    },
    radar: [
        {
            source: ['onlyfans.com/:username'],
        },
    ],
    name: 'Creator Posts',
    maintainers: ['TonyRL'],
    handler,
    url: 'onlyfans.com',
};

const baseUrl = 'https://onlyfans.com';

const { cookie } = config.onlyfans;
const authId = cookie?.match(/(?:^|;\s*)auth_id=(\d+)/)?.[1] ?? '0';
const browserId = cookie?.match(/(?:^|;\s*)fp=([^;\s]+)/)?.[1];

const get = async (path: string) => {
    const rules = await cache.tryGet('onlyfans:rules', () => ofetch('https://raw.githubusercontent.com/rafa-9/dynamic-rules/main/rules.json', { responseType: 'json' }), config.cache.routeExpire, false);
    const time = String(Date.now());
    const hash = createHash('sha1').update([rules.static_param, time, path, authId].join('\n')).digest('hex');
    const checksum = rules.checksum_indexes.reduce((sum: number, index: number) => sum + hash.codePointAt(index)!, rules.checksum_constant);

    return await ofetch(baseUrl + path, {
        headers: {
            accept: 'application/json',
            'app-token': rules['app-token'],
            ...(cookie && { cookie }),
            sign: `${rules.prefix}:${hash}:${Math.abs(checksum).toString(16)}:${rules.suffix}`,
            time,
            'x-bc': browserId ?? randomBytes(20).toString('hex'),
        },
    });
};
const renderMedia = (media) =>
    media
        .filter((m) => m.canView)
        .map((m) =>
            m.type === 'video' ? `<video controls preload="metadata" poster="${m.files.preview?.url}" src="${m.files.full?.url ?? m.videoSources?.[720] ?? m.videoSources?.[240]}"></video>` : `<img src="${m.files.full?.url}">`
        )
        .join('');

async function handler(ctx: Context) {
    const { username } = ctx.req.param();
    const limit = ctx.req.query('limit') ?? '20';

    const user = await cache.tryGet(`onlyfans:user:${username}`, () => get(`/api2/v2/users/${username}`));
    const posts = await get(`/api2/v2/users/${user.id}/posts?limit=${limit}&order=publish_date_desc&skip_users=all&format=infinite&pinned=0`);

    const items = posts.list.map((post) => ({
        title: sanitizeHtml(post.text, { allowedTags: [], allowedAttributes: {} }),
        description: (post.text ?? '') + renderMedia(post.media ?? []),
        link: `${baseUrl}/${post.id}/${user.username}`,
        pubDate: parseDate(post.postedAt),
        author: user.name,
    }));

    return {
        title: `${user.name} (@${user.username}) - OnlyFans`,
        description: sanitizeHtml(user.about, { allowedTags: [], allowedAttributes: {} }),
        link: `${baseUrl}/${user.username}`,
        image: user.avatar,
        item: items,
    };
}
