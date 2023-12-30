const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {
    const link = `https://developers.weixin.qq.com/miniprogram/dev/framework/release/`;
    const response = await got({
        method: 'get',
        url: link,
    });
    const data = response.data;
    const $ = cheerio.load(data);
    const name = $('#docContent .content h1')
        .text()
        .replace(/[\s|#]/g, '');

    ctx.state.data = {
        title: name,
        link,
        item: $('#docContent .content h2')
            .map((_, item) => {
                item = $(item);
                const title = item.text().replace(/[\s|#]/g, '');
                return {
                    title,
                    description: item.next().html(),
                    pubDate: timezone(parseDate(new RegExp(/\d{4}-\d{2}-\d{2}/).exec(title)), +8),
                    link: link + item.find('a.header-anchor').attr('href'),
                };
            })
            .get(),
        description: name,
    };
};
