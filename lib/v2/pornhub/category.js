const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const { defaultDomain, renderDescription } = require('./utils');
const config = require('@/config').value;

module.exports = async (ctx) => {
    const category = ctx.params.caty;

    const categories = await ctx.cache.tryGet('pornhub:categories', async () => {
        const { data } = await got(`${defaultDomain}/webmasters/categories`);
        return data.categories;
    });

    const categoryId = isNaN(category) ? categories.find((item) => item.category === category)?.id : category;
    const categoryName = isNaN(category) ? category : categories.find((item) => item.id === parseInt(category)).category;

    const response = await ctx.cache.tryGet(
        `pornhub:category:${categoryName}`,
        async () => {
            const { data } = await got(`${defaultDomain}/webmasters/search?category=${categoryName}`);
            return data;
        },
        config.cache.routeExpire,
        false
    );

    if (response.code) {
        throw Error(response.message);
    }

    const list = response.videos.map((item) => ({
        title: item.title,
        link: item.url,
        description: renderDescription({ thumbs: item.thumbs }),
        pubDate: parseDate(item.publish_date),
        category: [...new Set([...item.tags.map((t) => t.tag_name), ...item.categories.map((c) => c.category)])],
    }));

    ctx.state.data = {
        title: `Pornhub - ${categoryName}`,
        link: `${defaultDomain}/video?c=${categoryId}`,
        item: list,
    };
};
