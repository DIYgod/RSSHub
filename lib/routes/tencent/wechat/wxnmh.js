const got = require('@/utils/got');
const cheerio = require('cheerio');
const date = require('@/utils/date');

module.exports = async (ctx) => {
    const origin = 'https://www.wxnmh.com/';
    const response = await got.get(`${origin}user-${ctx.params.id}.htm`);
    const $ = cheerio.load(response.data);

    const name = $('#body .col-lg-9 .card-block .col-md-9 h3').text().trim();
    const description = $('#body .col-lg-9 .card-block .col-md-9 p').text().trim();

    const links = $('#body tr.thread .subject a')
        .map((index, ele) => {
            const title = $(ele).text();
            const link = origin + $(ele).attr('href');
            return { title, link };
        })
        .get();

    const item = await Promise.all(
        links.map(
            async (item) =>
                await ctx.cache.tryGet(item.link, async () => {
                    try {
                        const res = await got.get(item.link);
                        const $ = cheerio.load(res.data);
                        item.description = $('#message_content').html();
                        item.pubDate = date($('.date').text());
                        return item;
                    } catch (err) {
                        return Promise.resolve('');
                    }
                })
        )
    );

    ctx.state.data = {
        title: `${name} - 微信公众号`,
        link: 'https://www.wxnmh.com/',
        description,
        item,
    };
};
