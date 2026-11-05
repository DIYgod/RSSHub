import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
// Get the lastest blog posts of https://konghq.com/
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const BASE_URL = 'https://konghq.com';
const BLOG_POSTS_URL = `${BASE_URL}/blog`;

export const route: Route = {
    path: '/blog-posts',
    categories: ['programming'],
    example: '/konghq/blog-posts',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['konghq.com/blog/*'],
        },
    ],
    name: '博客最新文章',
    maintainers: ['piglei'],
    handler,
    url: 'konghq.com/blog/*',
};

async function handler() {
    // Always get the posts on the first page.
    const url = `${BLOG_POSTS_URL}/page/1`;

    // Request and parse the index page to get the posts
    const { data: response } = await got(url);
    const $ = load(response);
    const nextData = JSON.parse($('#__NEXT_DATA__').text());
    const posts: Array<DataItem & { link: string }> = nextData.props.pageProps.cardsPaged.cards.map((item) => {
        const title = item.title;
        const author = item.authors.map((author) => author.title).join(', ');
        const category = item.term.title;

        const link = new URL(item.link.href, BASE_URL).href;
        const pubDate = item.publishedAt ? parseDate(item.publishedAt) : undefined;
        return {
            title,
            link,
            pubDate,
            author,
            category,
        };
    });

    // Request each post to get the details content as "description"
    const items = await pMap(
        posts,
        (item) =>
            cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = load(response);

                // Update the description to post's main content
                $('.agent, .tt-none').remove();
                const sections = $('.toc-body > section[id]');
                item.description = sections.length
                    ? sections
                          .toArray()
                          .map((section) => $(section).html())
                          .join('')
                    : $('section[class^="blog_sections"]').first().html();
                return item;
            }),
        { concurrency: 3 }
    );

    return {
        title: 'Kong Inc(konghq.com) blog posts',
        link: BLOG_POSTS_URL,
        item: items,
    };
}
