import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: ['/hazyresearch/blog'],
    categories: ['blog'],
    example: '/stanford/hazyresearch/blog',
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
            source: ['hazyresearch.stanford.edu/blog'],
        },
    ],
    name: 'Hazy Research Blog',
    maintainers: ['dvorak0'],
    handler,
    url: 'hazyresearch.stanford.edu/blog',
};

async function handler() {
    const baseUrl = 'https://hazyresearch.stanford.edu';
    const currentUrl = `${baseUrl}/blog`;
    const { data: response } = await got(currentUrl);
    const $ = load(response);

    // Parse __NEXT_DATA__ for posts
    const nextDataRaw = $('script#__NEXT_DATA__').text();
    const nextData = JSON.parse(nextDataRaw);

    const posts = nextData.props.pageProps.posts || [];
    const buildId = nextData.buildId;

    const list = posts.map((post) => ({
        title: post.title,
        link: `${baseUrl}/blog/${post.slug}`,
        api: `${baseUrl}/_next/data/${buildId}/blog/${post.slug}.json`,
        author: post.author,
        pubDate: timezone(parseDate(post.dateString, 'MMM D, YYYY'), -7),
    }));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                // ✅ For full content, request real HTML page
                const { data: html } = await got(item.link);
                const $post = load(html);

                // Adjust the selector to match your page structure!
                const content = $post('main [class^="Post_content"]').html();

                item.description = content || '';

                return item;
            })
        )
    );

    return {
        title: 'Hazy Research Blog',
        link: currentUrl,
        description: 'Research updates from Stanford Hazy Research',
        language: 'en',
        item: items,
    };
}
