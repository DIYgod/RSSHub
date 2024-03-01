const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const { category } = ctx.params;
    const limit = Number.parseInt(ctx.query.limit, 10) || undefined;
    const baseUrl = 'https://www.bossdesign.cn';

    const currentCategory = await ctx.cache.tryGet(`bossdesign:categories:${category}`, async () => {
        const { data: categories } = await got(`${baseUrl}/wp-json/wp/v2/categories`);
        return categories.find((item) => item.slug === category || item.name === category);
    });

    const categoryId = currentCategory?.id;

    const { data: posts } = await got(`${baseUrl}/wp-json/wp/v2/posts`, {
        searchParams: {
            categories: categoryId,
            per_page: limit,
            _embed: '',
        },
    });

    const items = posts.map((item) => ({
        title: item.title.rendered,
        description: item.content.rendered,
        pubDate: parseDate(item.date_gmt),
        updated: parseDate(item.modified_gmt),
        link: item.link,
        guid: item.guid.rendered,
        category: [...new Set([...item._embedded['wp:term'][0].map((item) => item.name), ...item._embedded['wp:term'][1].map((item) => item.name)])],
    }));

    ctx.state.data = {
        title: currentCategory?.name ? `${currentCategory.name} | Boss设计` : 'Boss设计 | 收集国外设计素材网站的资源平台。',
        description: currentCategory?.description ?? 'Boss设计-收集国外设计素材网站的资源平台。专注于收集国外设计素材和国外设计网站，以及超实用的设计师神器，只为设计初学者和设计师提供海量的资源平台。..',
        image: currentCategory?.cover ?? `${baseUrl}/wp-content/themes/pinghsu/images/Bossdesign-ico.ico`,
        link: currentCategory?.link ?? baseUrl,
        item: items,
    };
};
