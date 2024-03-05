// @ts-nocheck
// use stock `got` package as a workaround for
// https://github.com/DIYgod/RSSHub/issues/8239
// https://github.com/DIYgod/RSSHub/pull/8288
import got from 'got';
import { parseDate } from '@/utils/parse-date';
const { categories } = require('./category-map');

const baseUrl = 'https://www.mckinsey.com.cn';
const endpoint = `${baseUrl}/wp-json`;

export default async (ctx) => {
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

    ctx.set('data', {
        title: category ? `McKinsey Greater China - ${categories[category].name}` : `McKinsey Greater China`,
        link: `${baseUrl}/${category === '25' ? categories[category].slug : `${categories[25].slug}/${categories[category].slug}`}/`,
        item: items,
    });
};
