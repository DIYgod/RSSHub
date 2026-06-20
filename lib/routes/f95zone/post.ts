import { load } from 'cheerio';

import { config } from '@/config';
import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { processContent } from './utils';

export const route: Route = {
    path: '/post/:thread/:postId',
    name: 'Post',
    maintainers: ['wsmbsbbz'],
    example: '/f95zone/post/vicineko-collection-2025-06-14-vicineko.84596/post-5909830',
    categories: ['game'],
    description: `Track content changes of a specific post. Uses the date \`[yyyy-mm-dd]\` in title for update detection.

URL format: \`https://f95zone.to/threads/{thread}/#post-{id}\` → replace \`#\` with \`/\` to get \`/f95zone/post/{thread}/post-{id}\`

Example: \`https://f95zone.to/threads/vicineko-collection-2025-06-14-vicineko.84596/#post-5909830\` → \`/f95zone/post/vicineko-collection-2025-06-14-vicineko.84596/post-5909830\`

Note: This route does not support Radar auto-detection because the post ID is in the URL hash (after \`#\`), which cannot be extracted by Radar. You need to manually construct the subscription URL.`,
    parameters: {
        thread: 'Thread slug with ID',
        postId: 'Post ID with `post-` prefix, replace `#` with `/` from browser URL',
    },
    features: {
        requireConfig: [
            {
                name: 'F95ZONE_COOKIE',
                optional: true,
                description: 'F95zone cookie for accessing restricted content.',
            },
        ],
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        nsfw: true,
    },
    radar: [],
    handler: async (ctx) => {
        const { thread, postId } = ctx.req.param();
        const baseUrl = 'https://f95zone.to';
        const link = `${baseUrl}/threads/${thread}/#${postId}`;

        const response = await ofetch(link, {
            headers: {
                referer: baseUrl,
                ...(config.f95zone.cookie ? { cookie: config.f95zone.cookie } : {}),
            },
        });

        const $ = load(response);
        const title = $('h1.p-title-value').text().trim();
        const post = $(`article[data-content="${postId}"]`);
        const content = post.find('.bbWrapper').html() || '';
        const author = post.attr('data-author') || '';
        const postDate = post.find('time.u-dt').first().attr('datetime');
        const tags = $('a.tagItem')
            .toArray()
            .map((el) => $(el).text().trim());

        // Extract [yyyy-mm-dd] from title for update tracking
        const dateMatch = title.match(/\[(\d{4}-\d{2}-\d{2})\]/);
        const updateDate = dateMatch?.[1];

        return {
            title: `[F95zone] ${title}`,
            link,
            item: [
                {
                    title: `[Updated] ${title}`,
                    link,
                    guid: updateDate ? `${link}_${updateDate}` : link,
                    description: processContent(content),
                    pubDate: updateDate ? parseDate(updateDate) : postDate ? parseDate(postDate) : undefined,
                    author,
                    category: tags,
                },
            ],
        };
    },
};
