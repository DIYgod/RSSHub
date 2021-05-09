const got = require('@/utils/got');
const cheerio = require('cheerio');
const date = require('@/utils/date');

module.exports = async (ctx) => {
    const rootUrl = 'https://www.commonapp.org';
    const jsonUrl = `${rootUrl}/page-data/sq/d/4283793559.json`;
    const response = await got({
        method: 'get',
        url: jsonUrl,
    });

    const list = response.data.data.allNodeBlogPost.edges.slice(0, 10).map((item) => ({
        title: item.node.title,
        pubDate: date(item.node.created),
        author: item.node.field_blog_author,
        link: `${rootUrl}${item.node.path.alias}`,
    }));

    const items = await Promise.all(
        list.map(
            async (item) =>
                await ctx.cache.tryGet(item.link, async () => {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.link,
                    });
                    const content = cheerio.load(detailResponse.data);

                    item.description = content('.inner-page').html();
                    item.pubDate = date(content('.publishing-date').text());
                    item.author = content('.publishing-author').text().replace('By ', '');

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
