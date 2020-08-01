const got = require('@/utils/got');
const cheerio = require('cheerio');
const queryString = require('query-string');

module.exports = async (ctx) => {
    const { appids } = ctx.params;
    const { data: html } = await got.get(`https://store.steampowered.com/news/`, {
        searchParams: queryString.stringify({ appids }),
    });
    const $ = cheerio.load(html);

    ctx.state.data = {
        title: $('.pageheader').text(),
        link: `https://store.steampowered.com/news/?appids=${appids}`,
        item: $('#news div[id]')
            .toArray()
            .map((a) => {
                const $el = $(a);
                return {
                    title: $el.find('.posttitle').text(),
                    link: $el.find('.posttitle a').attr('href'),
                    author: $el.find('.feed').text(),
                    description: $el.find('.body').html(),
                };
            })
            .filter((it) => it.title),
    };
};
