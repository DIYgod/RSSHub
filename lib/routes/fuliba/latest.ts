import { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/latest',
    categories: ['new-media'],
    example: '/fuliba/latest',
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
            source: ['fuliba2023.net/'],
        },
    ],
    name: '最新',
    maintainers: ['shinemoon'],
    handler,
    url: 'fuliba2023.net/',
};

async function handler(ctx) {
    const { data: response } = await got(`https://fuliba2023.net/wp-json/wp/v2/posts`, {
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
    }));

    return {
        title: '福利吧',
        link: `https://fuliba2023.net`,
        item: items,
    };
}
