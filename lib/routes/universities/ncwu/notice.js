const date = require('@/utils/date');
const got = require('@/utils/got');
const cheerio = require('cheerio');
const baseUrl = 'https://www5.ncwu.edu.cn/channels/5.html';

module.exports = async (ctx) => {
    const htmlCache = await ctx.cache.tryGet(
        baseUrl,
        async () => {
            const response = await got.get(baseUrl);
            return response.data;
        },
        60 * 60 * 12
    ); // 防止访问频率过高

    const $ = cheerio.load(htmlCache);
    const list = $('div.news-item');

    ctx.state.data = {
        title: '华水学校通知',
        link: baseUrl,
        item:
            list &&
            list
                .map((index, item) => ({
                    title: `「` + $(item).find('a.dw').text() + `」` + $(item).find('a.dw').next().text(),
                    description: $(item).find('div.detail').text(),
                    pubDate: date($(item).find('div.month').text() + '-' + $(item).find('div.day').text()),
                    link: $(item).find('a.dw').next().attr('href'),
                }))
                .get(),
    };
};
