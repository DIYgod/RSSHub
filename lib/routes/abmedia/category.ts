// @ts-nocheck
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const rootUrl = 'https://www.abmedia.io';
const cateAPIUrl = `${rootUrl}/wp-json/wp/v2/categories`;
const postsAPIUrl = `${rootUrl}/wp-json/wp/v2/posts`;

const getCategoryId = (category) => got.get(`${cateAPIUrl}?slug=${category}`).then((res) => res.data[0].id);

export default async (ctx) => {
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

    ctx.set('data', {
        title: `abmedia - ${category}`,
        link: `${rootUrl}/category/${category}`,
        item: items,
    });
};
