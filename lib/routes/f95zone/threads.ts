import { load } from 'cheerio';

import { config } from '@/config';
import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/threads/:threadId',
    name: 'Thread',
    maintainers: ['wsmbsbbz'],
    example: '/f95zone/threads/vicineko-collection-2025-06-14-vicineko.84596',
    categories: ['game'],
    parameters: {
        threadId: {
            description: 'Thread ID, can be found in the URL. e.g. `vicineko-collection-2025-06-14-vicineko.84596`',
        },
    },
    features: {
        requireConfig: [
            {
                name: 'F95ZONE_COOKIE',
                optional: true,
                description: 'F95zone cookie, can be obtained from browser developer tools.',
            },
        ],
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        nsfw: true,
    },
    radar: [
        {
            source: ['f95zone.to/threads/:threadId'],
            target: '/threads/:threadId',
        },
    ],
    handler: async (ctx) => {
        const { threadId } = ctx.req.param();
        const baseUrl = 'https://f95zone.to';
        const link = `${baseUrl}/threads/${threadId}/`;
        const cookie = config.f95zone.cookie;

        const response = await ofetch(link, {
            headers: {
                referer: baseUrl,
                'user-agent': config.trueUA,
                ...(cookie ? { cookie } : {}),
            },
        });

        const $ = load(response);

        // Get thread title
        const title = $('h1.p-title-value').text().trim();

        // Get the first post content (main post)
        const firstPost = $('article.message-body.js-selectToQuote').first();
        const content = firstPost.find('.bbWrapper').html() || '';

        // Process images to use full URLs
        const $content = load(content);
        $content('img').each((_, img) => {
            const src = $content(img).attr('src') || $content(img).attr('data-src');
            if (src && !src.startsWith('http')) {
                $content(img).attr('src', `${baseUrl}${src}`);
            } else if (src) {
                $content(img).attr('src', src);
            }
        });

        // Get post date
        const postDate = $('time.u-dt').first().attr('datetime');

        // Extract tags
        const tags = $('a.tagItem')
            .toArray()
            .map((tag) => $(tag).text().trim());

        return {
            title: `F95zone - ${title}`,
            link,
            item: [
                {
                    title,
                    link,
                    description: $content.html() || '',
                    pubDate: postDate,
                    category: tags,
                },
            ],
        };
    },
};
