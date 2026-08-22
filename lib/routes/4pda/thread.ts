import type { CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import iconv from 'iconv-lite';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const baseUrl = 'https://4pda.to';

export const route: Route = {
    path: '/forum/thread/:topicId',
    categories: ['bbs'],
    example: '/4pda/forum/thread/669936',
    parameters: { topicId: 'Topic ID, can be found in the URL as `showtopic` parameter' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
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
    const limit = Number.parseInt(ctx.req.query('limit') ?? '20');

    const threadUrl = `${baseUrl}/forum/index.php?showtopic=${topicId}`;

    // First fetch the thread to find the last page
    const lastPageUrl = `${threadUrl}&st=0`;
    const firstPageBuf = await ofetch(lastPageUrl, {
        responseType: 'arrayBuffer',
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'ru-RU,ru;q=0.9,en;q=0.8',
        },
    });
    const firstPageHtml = iconv.decode(Buffer.from(firstPageBuf), 'windows-1251');
    const $first = load(firstPageHtml);

    // Find the last page link from pagination
    const lastPageLink = $first('div.pagination a').last().attr('href');
    let targetUrl = lastPageUrl;
    if (lastPageLink && lastPageLink.includes('st=')) {
        const lastPageFullUrl = new URL(lastPageLink, baseUrl);
        targetUrl = lastPageFullUrl.href;
    }

    // Fetch the last page
    let $: CheerioAPI;
    if (targetUrl === lastPageUrl) {
        $ = $first;
    } else {
        const pageBuf = await ofetch(targetUrl, {
            responseType: 'arrayBuffer',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'ru-RU,ru;q=0.9,en;q=0.8',
            },
        });
        const pageHtml = iconv.decode(Buffer.from(pageBuf), 'windows-1251');
        $ = load(pageHtml);
    }

    const title = $('div.topic_title_post').first().contents().first().text().trim() || $('title').text().trim();

    const posts = $('div[data-post]')
        .toArray()
        .map((el) => {
            const $post = $(el);
            const postId = $post.attr('data-post');
            const postBody = $post.find('div.post_body');
            const dateText = $post.find('span.post_date').first().contents().first().text().trim();
            const author = $post.find('span.post_nick a[data-toggle="dropdown"]').text().trim();
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
        })
        .slice(-limit);

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
