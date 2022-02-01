const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const rootUrl = 'https://www.commonapp.org';
    const jsonUrl = `${rootUrl}/page-data/sq/d/4283793559.json`;
    const response = await got({
        method: 'get',
        url: jsonUrl,
    });

    const list = response.data.data.allNodeBlogPost.edges.map((item) => ({
        title: item.node.title,
        author: item.node.field_blog_author,
        pubDate: parseDate(item.node.created),
        link: `${rootUrl}${item.node.path.alias}`,
    }));

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = cheerio.load(detailResponse.data);

                item.description = content('.inner-page').html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: 'Blog - Common App',
        link: `${rootUrl}/blog`,
        item: items,
    };
};
