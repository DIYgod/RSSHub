// use stock `got` package as a workaround for
// https://github.com/DIYgod/RSSHub/issues/8239
// https://github.com/DIYgod/RSSHub/pull/8288
const got = require('got');
const { parseDate } = require('@/utils/parse-date');
const { categories } = require('./categoryMap');

const baseUrl = 'https://www.mckinsey.com.cn';
const endpoint = `${baseUrl}/wp-json`;

module.exports = async (ctx) => {
    const { category = '25' } = ctx.params;
    if (isNaN(category)) {
        categories.find((c) => c.slug === category);
    }

    const posts = await got(`${endpoint}/wp/v2/posts`, {
        searchParams: {
            per_page: ctx.query.limit ? Number(ctx.query.limit) : 50,
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

    ctx.state.data = {
        title: category ? `McKinsey Greater China - ${categories[category].name}` : `McKinsey Greater China`,
        link: `${baseUrl}/${category !== '25' ? `${categories[25].slug}/${categories[category].slug}` : categories[category].slug}/`,
        item: items,
    };
};
