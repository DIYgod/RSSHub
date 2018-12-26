const axios = require('../../utils/axios');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const { appids } = ctx.params;
    const { data: html } = await axios.get(`https://store.steampowered.com/news/`, {
        params: { appids },
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
