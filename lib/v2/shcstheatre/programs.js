const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const url = `https://www.shcstheatre.com/Program/programList.aspx`;
    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const items = $('#datarow > div')
        .map((_, elem) => {
            const title = $('.program-name', elem).text().trim();
            const link = new URL($('.program-name a', elem).attr('href'), url).toString();
            const description = $('a > img', elem).prop('outerHTML') + $('ul.program-intro', elem).prop('outerHTML');
            return {
                title,
                link,
                description,
            };
        })
        .toArray();
    const image = $('.menu-logo img').attr('src');

    ctx.state.data = {
        title: `上海文化广场 - 节目列表`,
        link: url,
        image,
        item: items,
    };
};
