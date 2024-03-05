// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const baseUrl = 'https://backlinko.com';
    const { data: response, url: link } = await got(`${baseUrl}/blog`);

    const $ = load(response);
    const nextData = JSON.parse($('#__NEXT_DATA__').text());
    const {
        buildId,
        props: { pageProps },
    } = nextData;

    const posts = [...pageProps.posts.nodes, ...pageProps.backlinkoLockedPosts.nodes].map((post) => ({
        title: post.title,
        link: `${baseUrl}/${post.slug}`,
        pubDate: parseDate(post.modified),
        author: post.author.node.name,
        apiUrl: `${baseUrl}/_next/data/${buildId}/${post.slug}.json`,
    }));

    const items = await Promise.all(
        posts.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data } = await got(item.apiUrl);
                const post = data.pageProps.post || data.pageProps.lockedPost;

                item.description = post.content;

                return item;
            })
        )
    );

    ctx.set('data', {
        title: pageProps.page.seo.title,
        description: pageProps.page.seo.metaDesc,
        link,
        language: 'en',
        item: items,
    });
};
