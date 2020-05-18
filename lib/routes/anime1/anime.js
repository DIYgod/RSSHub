const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const { time, name } = ctx.params;
    const $ = await got.get(`https://anime1.me/category/${encodeURIComponent(time)}/${encodeURIComponent(name)}`).then((r) => cheerio.load(r.data));
    const title = $('.page-title').text().trim();
    ctx.state.data = {
        title,
        link: `https://anime1.me/category/${time}/${name}`,
        description: title,
        item: $('article')
            .toArray()
            .map((art) => {
                const $el = $(art);
                const title = $el.find('.entry-title a').text();
                return {
                    title: $el.find('.entry-title a').text(),
                    link: $el.find('.entry-title a').attr('href'),
                    description: title,
                    pubDate: new Date($el.find('time').attr('datetime')).toUTCString(),
                };
            }),
    };
};
