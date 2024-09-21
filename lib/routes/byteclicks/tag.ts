import { Route } from '@/types';
import got from '@/utils/got';
import { parseItem } from './utils';
const baseUrl = 'https://byteclicks.com';

export const route: Route = {
    path: '/tag/:tag',
    categories: ['new-media'],
    example: '/byteclicks/tag/人工智能',
    parameters: { tag: '标签，可在URL中找到' },
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
            source: ['byteclicks.com/tag/:tag'],
        },
    ],
    name: '标签',
    maintainers: ['TonyRL'],
    handler,
    url: 'byteclicks.com/',
};

async function handler(ctx) {
    const tag = ctx.req.param('tag');
    const { data: search } = await got(`${baseUrl}/wp-json/wp/v2/tags`, {
        searchParams: {
            search: tag,
            per_page: 100,
        },
    });
    const tagData = search.find((item) => item.name === tag);

    const { data } = await got(`${baseUrl}/wp-json/wp/v2/posts`, {
        searchParams: {
            per_page: ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 100,
            tags: tagData.id,
        },
    });

    const items = parseItem(data);

    return {
        title: `${tagData.name} - 字节点击`,
        image: 'https://byteclicks.com/wp-content/themes/RK-Blogger/images/wbolt.ico',
        link: tagData.link,
        item: items,
    };
}
