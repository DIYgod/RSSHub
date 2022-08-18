const got = require('@/utils/got');
const cheerio = require('cheerio');
const rssParser = require('@/utils/rss-parser');

module.exports = async (ctx) => {
    const user = ctx.params.user;

    const rootUrl = 'https://blog.csdn.net';
    const blogUrl = `${rootUrl}/${user}`;
    const rssUrl = blogUrl + '/rss/list';

    const feed = await rssParser.parseURL(rssUrl);

    const items = await Promise.all(
        feed.items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const response = await got({
                    method: 'get',
                    url: item.link,
                });

                const $ = cheerio.load(response.data);

                const description = $('#content_views').html();

                return {
                    ...item,
                    description,
                };
            })
        )
    );

    ctx.state.data = {
        ...feed,
        title: `${feed.title} - CSDN博客`,
        item: items,
    };
};
