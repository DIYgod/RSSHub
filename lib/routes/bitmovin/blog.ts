import type { Route } from '@/types';
import { fetchGoogleNews } from '@/utils/google-news';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';
import timezone from '@/utils/timezone';

const baseUrl = 'https://bitmovin.com';

export const route: Route = {
    path: '/blog',
    categories: ['programming'],
    example: '/bitmovin/blog',
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
            source: ['bitmovin.com/blog', 'bitmovin.com/'],
        },
    ],
    name: 'Blog',
    maintainers: ['elxy'],
    handler,
    url: 'bitmovin.com/blog',
};

async function handler(ctx) {
    const apiUrl = `${baseUrl}/wp-json/wp/v2`;
    let data;
    try {
        ({ data } = await got(`${apiUrl}/posts`, {
            searchParams: {
                per_page: getRouteLimit(ctx, 100),
            },
        }));
    } catch {
        const feed = await fetchGoogleNews('site:bitmovin.com/blog');
        return {
            title: 'Blog - Bitmovin',
            link: `${baseUrl}/blog/`,
            item: feed.items
                .map((item) => ({
                    title: item.title ?? '',
                    description: item.content ?? item.contentSnippet,
                    pubDate: item.pubDate ? parseDate(item.pubDate) : undefined,
                    link: item.link,
                }))
                .filter((item) => item.title),
        };
    }

    const items = data.map((item) => ({
        title: item.title.rendered,
        author: item.authors.map((a) => a.display_name).join(', '),
        description: item.content.rendered,
        pubDate: item.date_gmt ? timezone(parseDate(item.date_gmt), 0) : undefined,
        link: item.link,
    }));

    return {
        title: 'Blog - Bitmovin',
        link: `${baseUrl}/blog/`,
        item: items,
    };
}
