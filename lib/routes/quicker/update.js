const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'https://getquicker.net/Help/Versions',
    });
    const data = response.data;
    const $ = cheerio.load(data);
    const list = $('div.version-list > div');

    const out = list
        .map((index, item) => {
            item = $(item);
            return {
                title: item.find('h2 > a').text(),
                description: item.find('div.article-content').html(),
                pubDate: item.find('div > span.text-secondary.d-lg-block.mb-2').text() || '1900/1/1',
                link: item.find('h2 > a').attr('href'),
            };
        })
        .get();

    ctx.state.data = {
        title: '版本更新 - Quicker',
        link: 'https://getquicker.net/Help/Versions',
        item: out,
    };
};
