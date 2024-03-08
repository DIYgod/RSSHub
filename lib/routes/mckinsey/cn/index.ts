import { Route } from '@/types';
// use stock `got` package as a workaround for
// https://github.com/DIYgod/RSSHub/issues/8239
// https://github.com/DIYgod/RSSHub/pull/8288
import got from 'got';
import { parseDate } from '@/utils/parse-date';
import { categories } from './category-map';

const baseUrl = 'https://www.mckinsey.com.cn';
const endpoint = `${baseUrl}/wp-json`;

export const route: Route = {
    path: '/cn/:category?',
    categories: ['other'],
    example: '/mckinsey/cn',
    parameters: { category: '分类，见下表，默认为全部' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '洞见',
    maintainers: ['laampui'],
    handler,
};

async function handler(ctx) {
    const { category = '25' } = ctx.req.param();
    if (isNaN(category)) {
        categories.find((c) => c.slug === category);
    }

    const posts = await got(`${endpoint}/wp/v2/posts`, {
        searchParams: {
            per_page: ctx.req.query('limit') ? Number(ctx.req.query('limit')) : 50,
            categories: category,
        },
    }).json();

    const items = posts.map((item) => ({
        title: item.title.rendered,
        description: item.content.rendered,
        link: item.link,
        guid: item.guid.rendered,
        pubDate: parseDate(item.date_gmt),
    }));

    return {
        title: category ? `McKinsey Greater China - ${categories[category].name}` : `McKinsey Greater China`,
        link: `${baseUrl}/${category === '25' ? categories[category].slug : `${categories[25].slug}/${categories[category].slug}`}/`,
        item: items,
    };
}
