import { load } from 'cheerio';

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
    description: `Track all replies in a thread. Only fetches the last 3 pages.

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
            referer: baseUrl,
            ...(config.f95zone.cookie ? { cookie: config.f95zone.cookie } : {}),
        };

        const firstPageResponse = await ofetch(threadLink, { headers });
        const $firstPage = load(firstPageResponse);
        const title = $firstPage('h1.p-title-value').text().trim();

        const lastPageLink = $firstPage('ul.pageNav-main li.pageNav-page:last-child a').attr('href');
        const totalPages = lastPageLink ? Number.parseInt(lastPageLink.match(/page-(\d+)/)?.[1] || '1', 10) : 1;

        const extractPosts = ($: ReturnType<typeof load>): DataItem[] =>
            $('article.message')
                .toArray()
                .flatMap((article) => {
                    const $article = $(article);
                    const postId = $article.attr('data-content')?.replace('post-', '');
                    if (!postId) {
                        return [];
                    }

                    const author = $article.find('.message-name a').text().trim();
                    const postDate = $article.find('time.u-dt').attr('datetime');
                    const content = $article.find('.bbWrapper').html() || '';
                    const postLink = `${threadLink}post-${postId}`;

                    // Get post number from the attribution list (e.g., "#717")
                    const postNumber = $article.find('.message-attribution-opposite--list li:last-child a').text().trim().replace('#', '') || postId;

                    return {
                        title: `#${postNumber} by ${author}`,
                        link: postLink,
                        guid: postLink,
                        description: processContent(content),
                        pubDate: postDate ? parseDate(postDate) : undefined,
                        author,
                    };
                });

        const allPosts: DataItem[] = [];
        const startPage = Math.max(1, totalPages - 2);

        for (let page = totalPages; page >= startPage; page--) {
            if (page === 1) {
                allPosts.push(...extractPosts($firstPage));
            } else {
                // eslint-disable-next-line no-await-in-loop
                const pageResponse = await ofetch(`${threadLink}page-${page}`, { headers });
                allPosts.push(...extractPosts(load(pageResponse)));
            }
        }

        allPosts.sort((a, b) => {
            const numA = Number.parseInt(a.title?.match(/#(\d+)/)?.[1] || '0', 10);
            const numB = Number.parseInt(b.title?.match(/#(\d+)/)?.[1] || '0', 10);
            return numB - numA;
        });

        return {
            title: `[F95zone] ${title}`,
            link: threadLink,
            item: allPosts,
        };
    },
};
