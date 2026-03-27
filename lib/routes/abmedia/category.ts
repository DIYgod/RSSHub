import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const rootUrl = 'https://www.abmedia.io';
const cateAPIUrl = `${rootUrl}/wp-json/wp/v2/categories`;
const postsAPIUrl = `${rootUrl}/wp-json/wp/v2/posts`;

const getCategoryId = (category) => got.get(`${cateAPIUrl}?slug=${category}`).then((res) => res.data[0].id);

export const route: Route = {
    path: '/:category?',
    categories: ['new-media'],
    example: '/abmedia/technology-development',
    parameters: { category: '类别，默认为产品技术' },
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
            source: ['www.abmedia.io/category/:catehory'],
            target: '/:category',
        },
    ],
    name: '类别',
    maintainers: [],
    handler,
    description: `参数可以从链接中拿到，如：

  \`https://www.abmedia.io/category/technology-development\` 对应 \`/abmedia/technology-development\``,
};

async function handler(ctx) {
    const category = ctx.req.param('category') ?? 'technology-development';
    const limit = ctx.req.param('limit') ?? 25;
    const categoryId = await getCategoryId(category);

    const response = await got.get(`${postsAPIUrl}?categories=${categoryId}&page=1&per_page=${limit}`);
    const data = response.data;

    const items = data.map((item) => ({
        title: item.title.rendered,
        link: item.link,
        description: item.content.rendered,
        pubDate: parseDate(item.date),
    }));

    return {
        title: `abmedia - ${category}`,
        link: `${rootUrl}/category/${category}`,
        item: items,
    };
}
