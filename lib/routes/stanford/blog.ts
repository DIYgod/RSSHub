import { load } from 'cheerio';
import pMap from 'p-map';

import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

interface HazyPost {
    title: string;
    author: string;
    slug: string;
    dateString?: string;
    external?: string;
}

export const route: Route = {
    path: '/hazyresearch/blog',
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

async function handler(): Promise<Data> {
    const baseUrl = 'https://hazyresearch.stanford.edu';
    const currentUrl = `${baseUrl}/blog`;
    const { data: response } = await got(currentUrl);
    const $ = load(response);

    // Parse __NEXT_DATA__ for posts
    const nextDataRaw = $('script#__NEXT_DATA__').text();
    const nextData = JSON.parse(nextDataRaw);

    const posts: HazyPost[] = nextData.props.pageProps.posts || [];
    const buildId = nextData.buildId;
    const externalLinks = new Map(posts.flatMap((post): Array<[string, string]> => (post.external?.startsWith('/') ? [[`${baseUrl}/blog/${post.slug}`, new URL(post.external, baseUrl).href]] : [])));

    const list: Array<DataItem & { link: string; api: string }> = posts.map((post) => ({
        title: post.title,
        link: `${baseUrl}/blog/${post.slug}`,
        api: `${baseUrl}/_next/data/${buildId}/blog/${post.slug}.json`,
        author: load(post.author, undefined, false).text(),
        pubDate: post.dateString ? parseDate(`${post.dateString} +0000`, 'MMM D, YYYY ZZ') : undefined,
    }));

    const items = await pMap(
        list,
        async (item) => {
            const detail = await cache.tryGet(`stanford:body:v3:${item.link}`, async () => {
                const { data: html } = await got(item.link);
                const $post = load(html);
                let content = $post('main [class^="Post_content"]').html();
                const externalUrl = externalLinks.get(item.link);
                if (!content && externalUrl) {
                    const { data: externalHtml } = await got(externalUrl);
                    const $external = load(externalHtml);
                    content = [$external('main img').first().toString(), $external('main [class^="Post_description"]').toString(), $external('main [class^="Post_content"]').html()].filter(Boolean).join('');
                }
                return { description: content || '' };
            });
            return { ...item, ...detail };
        },
        { concurrency: 3 }
    );

    return {
        title: 'Hazy Research Blog',
        link: currentUrl,
        description: 'Research updates from Stanford Hazy Research',
        language: 'en',
        item: items,
    };
}
