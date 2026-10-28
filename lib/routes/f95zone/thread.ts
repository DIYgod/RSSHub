import { type CheerioAPI, load } from 'cheerio';

import { config } from '@/config';
import type { DataItem, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { processContent } from './utils';

export const route: Route = {
    path: '/thread/:thread',
    name: 'Thread',
    maintainers: ['wsmbsbbz'],
    example: '/f95zone/thread/ubermation-collection-2026-01-19-uebermation-uebermation.231247',
    categories: ['game'],
    description: `Track replies on the first page of a thread.

URL format: \`https://f95zone.to/threads/{thread}/\` → use \`{thread}\` as the parameter.

Example: \`https://f95zone.to/threads/ubermation-collection-2026-01-19-uebermation-uebermation.231247/\` → \`/f95zone/thread/ubermation-collection-2026-01-19-uebermation-uebermation.231247\`

Note: If you want to track a specific post's content changes (e.g., first post with download links), use the \`/f95zone/post\` route instead.`,
    parameters: {
        thread: 'Thread slug with ID, copy from browser URL after `/threads/`',
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
    radar: [
        {
            source: ['f95zone.to/threads/:thread/*'],
            target: '/thread/:thread',
        },
    ],
    handler: async (ctx) => {
        const { thread } = ctx.req.param();
        const baseUrl = 'https://f95zone.to';
        const threadLink = `${baseUrl}/threads/${thread}/`;

        const headers = {
            ...(config.f95zone.cookie && { cookie: config.f95zone.cookie }),
        };

        const firstPageResponse = await ofetch(threadLink, { headers });
        const $firstPage = load(firstPageResponse);
        const title = $firstPage('h1.p-title-value').text();

        return {
            title: `[F95zone] ${title}`,
            link: threadLink,
            item: extractPosts($firstPage, threadLink),
        };
    },
};

function extractPosts($: CheerioAPI, threadLink: string): DataItem[] {
    return $('article.message')
        .toArray()
        .map((article) => {
            const $article = $(article);
            const postId = $article.attr('data-content')?.replace('post-', '');
            if (!postId) {
                return;
            }

            const author = $article.find('.message-name a').text();
            const postDate = $article.find('time.u-dt').attr('datetime');
            const content = $article.find('.bbWrapper').html() || '';
            const postLink = `${threadLink}post-${postId}`;

            // Get post number from the attribution list (e.g., "#717").
            const postNumber = $article.find('.message-attribution-opposite--list li:last-child a').text().trim().replace('#', '') || postId;

            return {
                title: `#${postNumber} by ${author}`,
                link: postLink,
                guid: postLink,
                description: processContent(content),
                pubDate: postDate ? parseDate(postDate) : undefined,
                author,
            };
        })
        .filter((post) => post !== undefined);
}
