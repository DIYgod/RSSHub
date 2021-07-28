const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const { keyword } = ctx.params;
    const $ = await got.get(`https://anime1.me/?s=${encodeURIComponent(keyword)}`).then((r) => cheerio.load(r.data));
    const title = $('.page-title').text().trim();
    ctx.state.data = {
        title,
        link: `https://anime1.me/?s=${keyword}`,
        description: title,
        item: $('article:has(.cat-links)')
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
