import { load } from 'cheerio';

import { config } from '@/config';
import type { DataItem, Route } from '@/types';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/thread/:threadTitle/:threadId',
    name: 'Thread',
    maintainers: ['wsmbsbbz'],
    example: '/f95zone/thread/ubermation-collection-2026-01-19-uebermation-uebermation/231247',
    categories: ['game'],
    description: 'Track all posts/replies in a thread. Only fetches the last few pages to get recent posts.',
    parameters: {
        threadTitle: {
            description: 'Thread title slug, can be found in the URL. e.g. `ubermation-collection-2026-01-19-uebermation-uebermation`',
        },
        threadId: {
            description: 'Thread ID, can be found in the URL. e.g. `231247`',
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
            target: '/thread/:threadTitle/:threadId',
        },
    ],
    handler: async (ctx) => {
        const { threadTitle, threadId } = ctx.req.param();
        const baseUrl = 'https://f95zone.to';
        const threadLink = `${baseUrl}/threads/${threadTitle}.${threadId}/`;
        const cookie = config.f95zone.cookie;

        const headers = {
            referer: baseUrl,
            'user-agent': config.trueUA,
            ...(cookie ? { cookie } : {}),
        };

        // Fetch first page to get thread title and total pages
        const firstPageResponse = await ofetch(threadLink, { headers });
        const $firstPage = load(firstPageResponse);

        const threadTitleText = $firstPage('h1.p-title-value').text().trim();

        // Extract author/creator name from thread title (last bracketed part, e.g. [ViciNeko])
        const authorMatch = threadTitleText.match(/\[([^\]]+)\](?:\s*$)/);
        const threadAuthor = authorMatch ? authorMatch[1] : threadTitleText;

        // Get total pages from pagination
        const lastPageLink = $firstPage('ul.pageNav-main li.pageNav-page:last-child a').attr('href');
        const totalPages = lastPageLink ? Number.parseInt(lastPageLink.match(/page-(\d+)/)?.[1] || '1', 10) : 1;

        // Process images helper function
        // Replace lazy-loaded src with data-src and thumbnail URLs with original URLs
        const processImages = (html: string): string => {
            const $content = load(html);
            $content('img').each((_, img) => {
                const $img = $content(img);
                const dataSrc = $img.attr('data-src');
                let src = $img.attr('src');

                if (dataSrc) {
                    src = dataSrc;
                    $img.removeAttr('data-src');
                } else if (src?.startsWith('data:')) {
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
                    $img.attr('src', src);
                }

                // Remove parent <a> tag, keep only <img>
                if ($parent.length && $parent.attr('target') === '_blank') {
                    $parent.replaceWith($img);
                }

                $img.removeClass('lazyload');
            });
            return $content.html() || '';
        };

        // Extract posts from a page
        const extractPosts = ($: ReturnType<typeof load>): DataItem[] => {
            const posts: DataItem[] = [];

            $('article.message').each((_, article) => {
                const $article = $(article);

                // Get post ID from data-content attribute
                const postId = $article.attr('data-content')?.replace('post-', '') || '';
                if (!postId) {
                    return;
                }

                // Get author
                const author = $article.find('.message-name a').text().trim();

                // Get post date
                const postDate = $article.find('time.u-dt').attr('datetime');

                // Format date to readable format (YYYY-MM-DD HH:mm)
                let formattedDate = '';
                if (postDate) {
                    const date = new Date(postDate);
                    formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
                }

                // Get post content
                const content = $article.find('article.message-body .bbWrapper').html() || '';
                const processedContent = processImages(content);

                // Get post link
                const postLink = `${threadLink}post-${postId}`;

                // Get post number (floor number) from the post link
                const postNumberLink = $article.find('a[href*="/post-"]').filter((_, el) => $(el).text().trim().startsWith('#'));
                const postNumber = postNumberLink.first().text().trim().replace('#', '') || postId;

                // Create clear title: [time] [thread author] #number by [post author]
                const itemTitle = `[${formattedDate}] [${threadAuthor}] #${postNumber} by ${author}`;

                posts.push({
                    title: itemTitle,
                    link: postLink,
                    guid: postLink,
                    description: processedContent,
                    pubDate: postDate,
                    author,
                });
            });

            return posts;
        };

        // Collect posts from last few pages (newest posts)
        const allPosts: DataItem[] = [];

        // Only fetch last 3 pages to get recent posts (avoid fetching all pages)
        const maxPagesToFetch = 3;
        const startPage = Math.max(1, totalPages - maxPagesToFetch + 1);

        // Fetch from last page backwards
        for (let page = totalPages; page >= startPage; page--) {
            if (page === 1) {
                // Use already fetched first page
                allPosts.push(...extractPosts($firstPage));
            } else {
                const pageUrl = `${threadLink}page-${page}`;
                // eslint-disable-next-line no-await-in-loop
                const pageResponse = await ofetch(pageUrl, { headers });
                const $page = load(pageResponse);
                allPosts.push(...extractPosts($page));
            }
        }

        // Sort by post number (newest first)
        allPosts.sort((a, b) => {
            const numA = Number.parseInt(a.title?.match(/#(\d+)/)?.[1] || '0', 10);
            const numB = Number.parseInt(b.title?.match(/#(\d+)/)?.[1] || '0', 10);
            return numB - numA;
        });

        return {
            title: `F95zone Posts - ${threadTitleText}`,
            link: threadLink,
            item: allPosts,
        };
    },
};
