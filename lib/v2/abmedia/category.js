const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

const rootUrl = 'https://www.abmedia.io';
const cateAPIUrl = `${rootUrl}/wp-json/wp/v2/categories`;
const postsAPIUrl = `${rootUrl}/wp-json/wp/v2/posts`;

const getCategoryId = async (category) => await got.get(`${cateAPIUrl}?slug=${category}`).then((res) => res.data[0].id);

module.exports = async (ctx) => {
    const category = ctx.params.category ?? 'technology-development';
    const limit = ctx.params.limit ?? 25;
    const categoryId = await getCategoryId(category);

    const response = await got.get(`${postsAPIUrl}?categories=${categoryId}&page=1&per_page=${limit}`);
    const data = response.data;

    const items = data.map((item) => ({
        title: item.title.rendered,
        link: item.link,
        description: item.content.rendered,
        pubDate: parseDate(item.date),
    }));

    ctx.state.data = {
        title: `abmedia - ${category}`,
        link: `${rootUrl}/category/${category}`,
        item: items,
    };
};
