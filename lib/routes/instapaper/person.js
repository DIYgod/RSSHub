const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const name = ctx.params.name;
    const link = `https://www.instapaper.com/p/${name}`;

    const response = await got.get(link);
    const $ = cheerio.load(response.data);

    const out = $('article.article_item.article_browse')
        .slice(0, 10)
        .map(function () {
            const info = {
                title: $(this).find('div.js_title_row.title_row a').attr('title'),
                link: $(this).find('div.js_title_row.title_row a').attr('href'),
                description: $(this).find('div.article_preview').text(),
            };
            return info;
        })
        .get();

    ctx.state.data = {
        title: `${name}-Instapaper分享`,
        link: link,
        item: out,
    };
};
