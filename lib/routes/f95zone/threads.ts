import { load } from 'cheerio';

import { config } from '@/config';
import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/threads/:threadTitle/:threadId',
    name: 'Thread',
    maintainers: ['wsmbsbbz'],
    example: '/f95zone/threads/vicineko-collection-2025-06-14-vicineko/84596',
    categories: ['game'],
    parameters: {
        threadTitle: {
            description: 'Thread title slug, can be found in the URL. e.g. `vicineko-collection-2025-06-14-vicineko`',
        },
        threadId: {
            description: 'Thread ID, can be found in the URL. e.g. `84596`',
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
            source: ['f95zone.to/threads/:threadTitle.:threadId/*'],
            target: '/threads/:threadTitle/:threadId',
        },
    ],
    handler: async (ctx) => {
        const { threadTitle, threadId } = ctx.req.param();
        const baseUrl = 'https://f95zone.to';
        const link = `${baseUrl}/threads/${threadTitle}.${threadId}/`;
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
        // Site uses lazy loading - real URL is in data-src, src contains SVG placeholder
        const $content = load(content);
        $content('img').each((_, img) => {
            const $img = $content(img);
            const dataSrc = $img.attr('data-src');
            const src = dataSrc || $img.attr('src');

            if (src && !src.startsWith('data:')) {
                if (src.startsWith('http')) {
                    $img.attr('src', src);
                } else {
                    $img.attr('src', `${baseUrl}${src}`);
                }
            } else if (dataSrc) {
                $img.attr('src', dataSrc);
            }

            // Clean up lazy loading attributes
            $img.removeAttr('data-src');
            $img.removeClass('lazyload');
        });

        // Get post date
        const postDate = $('time.u-dt').first().attr('datetime');

        // Extract tags
        const tags = $('a.tagItem')
            .toArray()
            .map((tag) => $(tag).text().trim());

        // Extract date from title [yyyy-mm-dd] for guid
        const dateMatch = title.match(/\[(\d{4}-\d{2}-\d{2})\]/);
        const updateDate = dateMatch ? dateMatch[1] : '';
        const guid = updateDate ? `${link}#${updateDate}` : link;

        return {
            title: `F95zone - ${title}`,
            link,
            item: [
                {
                    title,
                    link,
                    guid,
                    description: $content.html() || '',
                    pubDate: postDate,
                    category: tags,
                },
            ],
        };
    },
};
