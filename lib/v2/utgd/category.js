const got = require('@/utils/got');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');
const md = require('markdown-it')({
    html: true,
});

module.exports = async (ctx) => {
    const category = ctx.params.category ?? 'method';
    const limit = ctx.query.limit ? parseInt(ctx.query.limit) : 20;

    const rootUrl = 'https://utgd.net';
    const apiUrl = `${rootUrl}/api/v2/pages/`;
    const currentUrl = `${rootUrl}/category/s/${category}`;
    const slugUrl = `${rootUrl}/api/v2/category/slug/${category}/`;

    let response = await got({
        method: 'get',
        url: slugUrl,
    });

    const data = response.data;

    response = await got({
        method: 'get',
        url: apiUrl,
        searchParams: {
            type: 'article.Article',
            fields: `article_category(category_name),article_tag(tag_name),title,article_image,article_author,article_content,article_published_time`,
            article_category: data.id,
            order: '-article_published_time',
            limit,
        },
    });

    const items = await Promise.all(
        response.data.items.map((item) =>
            ctx.cache.tryGet(`untag-${item.id}`, async () => {
                const authorResponse = await got({
                    method: 'get',
                    url: `${rootUrl}/api/v2/user/profile/${item.article_author.id}/`,
                });

                return {
                    title: item.title,
                    link: `${rootUrl}/article/${item.id}`,
                    description: art(path.join(__dirname, 'templates/description.art'), {
                        image: item.article_image,
                        description: md.render(item.article_content),
                    }),
                    author: authorResponse.data.display_name,
                    pubDate: timezone(parseDate(item.article_published_time), +8),
                    category: [...item.article_category.map((c) => c.category_name), ...item.article_tag.map((t) => t.tag_name)],
                };
            })
        )
    );

    ctx.state.data = {
        title: `UNTAG - ${data.category_name}`,
        link: currentUrl,
        item: items,
        image: data.category_image,
        description: data.category_description,
    };
};
