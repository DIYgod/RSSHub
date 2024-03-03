// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import { config } from '@/config';
import { art } from '@/utils/render';
import * as path from 'node:path';

export default async (ctx) => {
    const { q, order = 'latest' } = ctx.req.param();
    const key = config.pixabay?.key ?? '7329690-bbadad6d872ba577d5a358679';
    const baseUrl = 'https://pixabay.com';

    const data = await cache.tryGet(
        `pixabay:search:${q}:${order}`,
        async () => {
            const { data } = await got(`${baseUrl}/api/`, {
                searchParams: {
                    key,
                    q,
                    order,
                    per_page: ctx.req.query('limit') ?? 200,
                },
            });
            return data;
        },
        Math.max(config.cache.contentExpire, 24 * 60 * 60), // required by Pixabay API
        false
    );

    const items = data.hits.map((item) => {
        const { pageURL, tags, user } = item;
        return {
            title: pageURL
                .substring(pageURL.lastIndexOf('/', pageURL.lastIndexOf('/') - 1) + 1, pageURL.lastIndexOf('/'))
                .replace(/(-\d+)$/, '')
                .replaceAll('-', ' '),
            description: art(path.join(__dirname, 'templates/img.art'), { item }),
            link: pageURL,
            category: tags.split(', '),
            author: user,
        };
    });

    ctx.set('data', {
        title: `Search ${q} - Pixabay`,
        description: 'Download & use free nature stock photos in high resolution ✓ New free images everyday ✓ HD to 4K ✓ Best nature pictures for all devices on Pixabay',
        link: `${baseUrl}/images/search/${q}/${order === 'latest' ? '?order=latest' : ''}`,
        image: `https://pixabay.com/apple-touch-icon.png`,
        language: 'en',
        item: items,
    });
};
