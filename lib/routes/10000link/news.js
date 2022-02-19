const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');

module.exports = async (ctx) => {
    const category = ctx.params.category;
    const pageUrl = `http://info.10000link.com/newslists.aspx?chid=${category}`;
    const host = 'http://info.10000link.com';
    const response = await got({
        method: 'get',
        url: pageUrl,
    });
    const $ = cheerio.load(response.data);
    const list = $('.l_newshot li').get();

    const ProcessFeed = async (link) => {
        const response = await got({
            method: 'get',
            url: link,
        });

        const $ = cheerio.load(response.data);

        return $('#news_body').html();
    };

    const items = await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);
            const $a = $('h1 a');
            const link = url.resolve(host, $a.attr('href'));

            const cache = await ctx.cache.get(link);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const description = await ProcessFeed(link);

            const single = {
                title: $a.text(),
                description,
                link,
                pubDate: new Date($('.ymd_w').text()).toUTCString(),
                author: $('.day-lx span:first-child').text(),
            };

            ctx.cache.set(link, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: `万联网 ${$('.t-h2').text().replace(' ｜资讯频道', '')}`,
        link: pageUrl,
        description: $('meta[name="Description"]').attr('content'),
        item: items,
    };
};
