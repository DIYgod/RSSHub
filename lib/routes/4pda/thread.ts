import { load } from 'cheerio';

import type { Route } from '@/types';
import { parseDate } from '@/utils/parse-date';
import { getPlaywrightPage } from '@/utils/playwright';
import timezone from '@/utils/timezone';

const baseUrl = 'https://4pda.to';

export const route: Route = {
    path: '/forum/thread/:topicId',
    categories: ['bbs'],
    example: '/4pda/forum/thread/669936',
    parameters: { topicId: 'Topic ID, can be found in the URL as `showtopic` parameter' },
    features: {
        requireConfig: false,
        requirePuppeteer: true,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['4pda.to/forum/index.php'],
            target: (_, url) => {
                const urlObj = new URL(url);
                const topicId = urlObj.searchParams.get('showtopic');
                if (topicId) {
                    return `/4pda/forum/thread/${topicId}`;
                }
                return '';
            },
        },
    ],
    name: 'Forum Thread',
    maintainers: ['untitaker'],
    handler,
    description: 'Subscribe to new posts in a 4PDA forum thread. Returns the most recent page of posts.',
};

async function handler(ctx) {
    const topicId = ctx.req.param('topicId');
    const threadUrl = `${baseUrl}/forum/index.php?showtopic=${topicId}`;

    // Fetch the first page to find the last page link
    const { page, destroy } = await getPlaywrightPage(`${threadUrl}&st=0`, {
        onBeforeLoad: async (page) => {
            await page.route('**/*', (route) => (['document', 'script', 'stylesheet'].includes(route.request().resourceType()) ? route.continue() : route.abort()));
        },
        gotoConfig: { waitUntil: 'domcontentloaded' },
    });

    let html = await page.content();
    const $first = load(html);

    // Find the last page link from pagination
    const lastPageLink = $first('div.pagination a').last().attr('href');
    if (lastPageLink && lastPageLink.includes('st=')) {
        const lastPageFullUrl = new URL(lastPageLink, baseUrl).href;
        await page.goto(lastPageFullUrl, { waitUntil: 'domcontentloaded' });
        html = await page.content();
    }

    await destroy();

    const $ = load(html);
    const title = $('div.topic_title_post').first().contents().first().text().trim() || $('title').text().trim();

    const posts = $('div[data-post]')
        .toArray()
        .map((el) => {
            const $post = $(el);
            const postId = $post.attr('data-post');
            const postBody = $post.find('div.post_body');
            const dateText = $post.find('span.post_date').first().contents().first().text().trim();
            const authorEl = $post.find('span.post_nick a[data-toggle="dropdown"]');
            const author = authorEl.contents().first().text().trim();
            const floorLink = $post.find('span.post_date a').attr('href');
            const floor = $post.find('span.post_date a').text().trim();

            const link = floorLink ? new URL(floorLink, baseUrl).href : `${threadUrl}&view=findpost&p=${postId}`;

            // Parse date in format "DD.MM.YY, HH:MM"
            let pubDate;
            if (dateText) {
                const cleaned = dateText.replace(/\s*\|\s*$/, '').trim();
                const match = cleaned.match(/(\d{2})\.(\d{2})\.(\d{2}),\s*(\d{2}):(\d{2})/);
                if (match) {
                    const [, day, month, year, hour, minute] = match;
                    pubDate = timezone(parseDate(`20${year}-${month}-${day} ${hour}:${minute}`, 'YYYY-MM-DD HH:mm'), 3);
                }
            }

            return {
                title: `${title} ${floor}`,
                link,
                description: postBody.html() ?? '',
                author,
                pubDate,
            };
        });

    // Reverse so newest posts appear first in the feed
    posts.reverse();

    return {
        title: `4PDA — ${title}`,
        link: threadUrl,
        description: `Forum thread: ${title}`,
        language: 'ru' as const,
        item: posts,
    };
}
