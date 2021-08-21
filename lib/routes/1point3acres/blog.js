const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const category = ctx.params.category || '';

    const rootUrl = 'https://www.1point3acres.com';
    const currentUrl = `${rootUrl}/${category === '' ? 'BlogPosts' : `category/${category.replace(/-/g, '/')}`}`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });
    const $ = cheerio.load(response.data);

    const list = $('.mybloglist h2 a')
        .slice(0, 10)
        .map((_, item) => {
            item = $(item);
            return {
                title: item.text(),
                link: item.attr('href'),
            };
        })
        .get();

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });
                const content = cheerio.load(detailResponse.data);

                content('h2, .meta_tags, .pagination, .subinfopost, #comments').remove();

                item.description = content('.post').html();
                item.pubDate = new Date(detailResponse.data.match(/"datePublished":"(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+00:00)","dateModified":/)[1]).toUTCString();

                return item;
            })
        )
    );

    const title = $('title').text().split(' | ')[0];

    ctx.state.data = {
        title: `${title === 'BlogPosts' ? '全部' : title} - 一亩三分地论坛博客`,
        link: currentUrl,
        item: items,
    };
};
