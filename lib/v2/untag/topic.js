const got = require('@/utils/got');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');
const md = require('markdown-it')({
    html: true,
});

module.exports = async (ctx) => {
    const topic = ctx.params.topic ?? '在线阅读专栏';
    const limit = ctx.query.limit ? parseInt(ctx.query.limit) : 20;

    const rootUrl = 'https://utgd.net';
    const currentUrl = `${rootUrl}/topic`;
    const topicUrl = `${rootUrl}/api/v2/topic/`;

    let response = await got({
        method: 'get',
        url: topicUrl,
    });

    const topicItems = response.data.filter((i) => i.title === topic);

    if (!topicItems) {
        throw Error(`No topic named ${topic}`);
    }

    const topicItem = topicItems[0];

    const apiUrl = `${rootUrl}/api/v2/topic/${topicItem.id}/article/`;

    response = await got({
        method: 'get',
        url: apiUrl,
    });

    const items = await Promise.all(
        response.data.slice(0, limit).map((item) =>
            ctx.cache.tryGet(`untag-${item.id}`, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: `${rootUrl}/api/v2/pages/${item.id}/`,
                    searchParams: {
                        fields: 'article_content',
                    },
                });

                return {
                    title: item.title,
                    link: `${rootUrl}/article/${item.id}`,
                    description: art(path.join(__dirname, 'templates/description.art'), {
                        image: item.article_image,
                        description: md.render(detailResponse.data.article_content),
                    }),
                    author: item.article_author_displayname,
                    pubDate: timezone(parseDate(item.article_published_time), +8),
                    category: [...item.article_category.map((c) => c.name), ...item.article_tag.map((t) => t.name)],
                };
            })
        )
    );

    ctx.state.data = {
        title: `UNTAG - ${topicItem.title}`,
        link: currentUrl,
        item: items,
        description: topicItem.summary,
    };
};
