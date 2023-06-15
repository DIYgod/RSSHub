const got = require('@/utils/got');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');
const md = require('markdown-it')({
    html: true,
});

module.exports = async (ctx) => {
    const limit = ctx.query.limit ? parseInt(ctx.query.limit) : 20;

    const rootUrl = 'https://utgd.net';
    const apiUrl = `${rootUrl}/api/v2/timeline/?page=1&page_size=${limit}`;

    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    const items = await Promise.all(
        response.data.results.slice(0, limit).map((item) =>
            ctx.cache.tryGet(`untag-${item.id}`, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: `${rootUrl}/api/v2/pages/${item.id}/`,
                    searchParams: {
                        fields: 'article_content,article_category(category_name),article_tag(tag_name)',
                    },
                });

                const data = detailResponse.data;

                return {
                    title: item.title,
                    link: `${rootUrl}/article/${item.id}`,
                    description: art(path.join(__dirname, 'templates/description.art'), {
                        image: item.article_image,
                        description: md.render(data.article_content),
                    }),
                    author: item.article_author_displayname,
                    pubDate: timezone(parseDate(item.article_published_time), +8),
                    category: [...data.article_category.map((c) => c.category_name), ...data.article_tag.map((t) => t.tag_name)],
                };
            })
        )
    );

    ctx.state.data = {
        title: 'UNTAG',
        link: rootUrl,
        item: items,
    };
};
