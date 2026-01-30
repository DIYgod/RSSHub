import { load } from 'cheerio';

import { config } from '@/config';
import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/post/:threadTitle/:threadId',
    name: 'Post',
    maintainers: ['wsmbsbbz'],
    example: '/f95zone/post/vicineko-collection-2025-06-14-vicineko/84596',
    categories: ['game'],
    description: 'Track updates to the first post of a thread. Uses the date in title [yyyy-mm-dd] for update detection.',
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
            target: '/post/:threadTitle/:threadId',
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

        // Process images: replace lazy-loaded src with data-src and clean up
        // Also replace thumbnail URLs with original image URLs
        const $content = load(content);
        const seenImages = new Set<string>();
        $content('img').each((_, img) => {
            const $img = $content(img);
            const dataSrc = $img.attr('data-src');
            let src = $img.attr('src');

            if (dataSrc) {
                // Use data-src as the real image URL
                src = dataSrc;
                $img.removeAttr('data-src');
            } else if (src?.startsWith('data:')) {
                // Remove placeholder images without data-src
                $img.remove();
                return;
            }

            // Check if parent <a> has original image URL (not thumbnail)
            const $parent = $img.parent('a');
            const parentHref = $parent.attr('href');
            if (parentHref && parentHref.includes('attachments.f95zone.to') && !parentHref.includes('/thumb/')) {
                // Use the original image URL from parent link
                src = parentHref;
            } else if (src && src.includes('/thumb/')) {
                // Remove /thumb/ from URL to get original image
                src = src.replace('/thumb/', '/');
            }

            if (src) {
                // Remove duplicate images
                if (seenImages.has(src)) {
                    $img.remove();
                    return;
                }
                seenImages.add(src);
                $img.attr('src', src);
            }

            // Remove parent <a> tag, keep only <img>
            if ($parent.length && $parent.attr('target') === '_blank') {
                $parent.replaceWith($img);
            }

            // Clean up lazy loading attributes
            $img.removeClass('lazyload');
        });

        // Get post date
        const postDate = $('time.u-dt').first().attr('datetime');

        // Extract tags
        const tags = $('a.tagItem')
            .toArray()
            .map((tag) => $(tag).text().trim());

        // Extract update date from title [yyyy-mm-dd] for tracking updates
        const dateMatch = title.match(/\[(\d{4}-\d{2}-\d{2})\]/);
        const updateDate = dateMatch ? dateMatch[1] : '';
        // Use date in guid so RSS readers treat updates as new items
        const guid = updateDate ? `${link}#${updateDate}` : link;
        // Use extracted date for pubDate, fallback to post date if not found
        const pubDate = updateDate ? new Date(updateDate) : postDate;

        return {
            title: `F95zone - ${title}`,
            link,
            item: [
                {
                    title: `[Post Updated] ${title}`,
                    link,
                    guid,
                    description: $content.html() || '',
                    pubDate,
                    category: tags,
                },
            ],
        };
    },
};
