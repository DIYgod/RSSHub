import { load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const handler: Route['handler'] = async () => {
    const data = await ofetch('https://nextjs.org/blog');

    const $ = load(data);

    const item = await pMap(
        $('article').slice(0, 20).toArray(),
        (item) => {
            const $ = load(item);
            const link = `https://nextjs.org${$('a[href^="/blog"]').attr('href')}`;

            return cache.tryGet(`nextjs:blog:${link}:published-date:authors`, async () => {
                const data = await ofetch(link);

                const $ = load(data);

                const publishedAt = $('meta[property="article:published_time"]').attr('content');
                const metadata: { author?: Array<{ name?: string }> } = JSON.parse($('script[type="application/ld+json"]').first().text() || '{}');
                const author = metadata.author?.flatMap((author) => (author.name ? [{ name: author.name }] : []));

                return {
                    title: $('h1').text(),
                    link,
                    description: $('div.prose').html(),
                    pubDate: publishedAt ? parseDate(publishedAt) : undefined,
                    author: author?.length ? author : undefined,
                };
            });
        },
        { concurrency: 3 }
    );

    return {
        title: 'Next.js Blog',
        link: 'https://nextjs.org/blog',
        language: 'en-us',
        item,
    };
};

export const route: Route = {
    path: '/blog',
    name: 'Blog',
    categories: ['program-update'],
    maintainers: ['equt'],
    example: '/nextjs/blog',
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    handler,
};
