const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const pageUrl = 'http://www.cfan.com.cn/news/';
    const response = await got.get(pageUrl);
    const $ = cheerio.load(response.data);
    const list = $('.ui-video-list').get();

    const ProcessFeed = async (link) => {
        const response = await got({
            method: 'get',
            url: link,
        });
        const $ = cheerio.load(response.data);

        return $('.maincontent').html() || '文章已被删除';
    };

    const items = await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);
            const link = $('.left-post a').attr('href');

            const cache = await ctx.cache.get(link);
            if (cache) {
                return JSON.parse(cache);
            }

            const description = await ProcessFeed(link);

            const single = {
                title: $('.left-post-title').text(),
                description,
                link,
                pubDate: new Date($('.left-post-date').text()).toUTCString(),
            };

            ctx.cache.set(link, JSON.stringify(single));
            return single;
        })
    );

    ctx.state.data = {
        title: $('title').text(),
        link: pageUrl,
        item: items,
    };
};
