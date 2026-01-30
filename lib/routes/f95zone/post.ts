import { load } from 'cheerio';

import { config } from '@/config';
import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/post/:thread/:postId',
    name: 'Post',
    maintainers: ['wsmbsbbz'],
    example: '/f95zone/post/vicineko-collection-2025-06-14-vicineko.84596/post-1893498',
    categories: ['game'],
    description: 'Track content changes of a specific post. When the post content is updated, a new item will be generated. If the thread title contains a date `[yyyy-mm-dd]`, it will be used for update detection.',
    parameters: {
        thread: {
            description: 'Thread slug with ID',
        },
        postId: {
            description: 'Post ID with `post-` prefix, copy from browser URL and replace `#` with `/`',
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
            source: ['f95zone.to/threads/:thread/*'],
            target: '/post/:thread',
        },
    ],
    handler: async (ctx) => {
        const { thread, postId } = ctx.req.param();
        const baseUrl = 'https://f95zone.to';

        const link = `${baseUrl}/threads/${thread}/#${postId}`;
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

        // Get the target post by postId
        const targetPost = $(`article[data-content="${postId}"]`);

        // Get post content from the target post
        const postBody = targetPost.find('article.message-body.js-selectToQuote');
        const content = postBody.find('.bbWrapper').html() || '';

        // Get post author
        const author = targetPost.attr('data-author') || '';

        // Get post date from the target post
        const postDate = targetPost.find('time.u-dt').first().attr('datetime');

        // Process images: clean up lazy loading, use original URLs, remove duplicates
        const $content = load(content);

        // Remove noscript tags (contain duplicate images)
        $content('noscript').remove();

        const seenImages = new Set<string>();
        $content('img').each((_, img) => {
            const $img = $content(img);
            const $parent = $img.parent('a');

            // Get original image URL: parent href > data-src > src (remove /thumb/)
            let src = $parent.attr('href') || $img.attr('data-src') || $img.attr('src') || '';
            src = src.replace('/thumb/', '/');

            // Remove placeholder or duplicate images
            if (!src || src.startsWith('data:') || seenImages.has(src)) {
                $img.remove();
                return;
            }

            seenImages.add(src);
            $img.attr('src', src).removeAttr('data-src').removeClass('lazyload');

            // Unwrap from parent <a> tag
            if ($parent.length) {
                $parent.replaceWith($img);
            }
        });

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
            title: `[F95zone] ${title}`,
            link,
            item: [
                {
                    title: updateDate ? `[${updateDate}] ${title}` : title,
                    link,
                    guid,
                    description: $content.html() || '',
                    pubDate,
                    author,
                    category: tags,
                },
            ],
        };
    },
};
