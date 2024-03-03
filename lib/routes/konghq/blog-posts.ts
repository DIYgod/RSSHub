// @ts-nocheck
import cache from '@/utils/cache';
// Get the lastest blog posts of https://konghq.com/
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

const BASE_URL = 'https://konghq.com';
const BLOG_POSTS_URL = `${BASE_URL}/blog`;

export default async (ctx) => {
    // Always get the posts on the first page.
    const url = `${BLOG_POSTS_URL}/page/1`;

    // Request and parse the index page to get the posts
    const { data: response } = await got(url);
    const $ = load(response);
    const nextData = JSON.parse($('#__NEXT_DATA__').text());
    const posts = nextData.props.pageProps.cardsPaged.cards.map((item) => {
        const title = item.title;
        const author = item.authors.map((author) => author.title).join(', ');
        const category = item.term.title;

        const link = `${BASE_URL}${item.link.href}`;
        const pubDate = parseDate(item.publishedAt);
        return {
            title,
            link,
            pubDate,
            author,
            category,
        };
    });

    // Request each post to get the details content as "description"
    const items = await Promise.all(
        posts.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = load(response);

                // Update the description to post's main content
                item.description = $('section[class^="blog_sections"]').first().html();
                return item;
            })
        )
    );

    ctx.set('data', {
        title: `Kong Inc(konghq.com) blog posts`,
        link: BLOG_POSTS_URL,
        item: items,
    });
};
