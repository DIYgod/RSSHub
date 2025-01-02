import { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/blogs',
    categories: ['blog'],
    example: '/geocaching/blogs',
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
            source: ['geocaching.com/blog/', 'geocaching.com/'],
        },
    ],
    name: 'Official Blogs',
    maintainers: ['HankChow'],
    handler,
    url: 'geocaching.com/blog/',
};

async function handler(ctx) {
    const baseUrl = 'https://www.geocaching.com';
    const { data: response } = await got(`${baseUrl}/blog/wp-json/wp/v2/posts`, {
        searchParams: {
            per_page: ctx.req.query('limit') ?? 100,
            _embed: 1,
        },
    });

    const items = response.map((item) => ({
        title: item.title.rendered,
        link: item.link,
        guid: item.guid.rendered,
        description: item.content.rendered,
        pubDate: parseDate(item.date_gmt),
        author: item._embedded.author[0].name,
        category: item._embedded['wp:term'][0].map((category) => category.name),
    }));

    return {
        title: 'Geocaching Blog',
        link: `${baseUrl}/blog/`,
        image: `${baseUrl}/blog/favicon.ico`,
        description: 'Geocaching 博客更新',
        item: items,
    };
}
