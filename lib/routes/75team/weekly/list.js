const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await got.get('https://weekly.75team.com');
    const $ = cheerio.load(response.data);
    const items = [];

    $('.issue-list li')
        .slice(0, 10)
        .each((i, e) => {
            const ele = $('a', e);
            const date = $('.date', e);
            items.push({
                title: ele.text().trim(),
                link: 'https://weekly.75team.com/' + ele.attr('href'),
                pubDate: new Date(date.text().trim()).toUTCString(),
            });
        });

    ctx.state.data = {
        title: `奇舞周刊`,
        link: `https://weekly.75team.com/`,
        item: items,
    };
};
