const got = require('@/utils/got');
const cheerio = require('cheerio');
const date = require('@/utils/date');

module.exports = async (ctx) => {
    const category = ctx.params.category;
    const url = `http://www.yystv.cn/b/${category}`;
    const response = await got({
        method: 'get',
        url: url,
    });

    const data = response.data;
    const $ = cheerio.load(data);

    const first_part = $('.b-list-main-item')
        .slice(0, 2)
        .map(function () {
            const info = {
                title: $(this).find('.b-main-info-title').text(),
                link: 'http://www.yystv.cn' + $(this).find('.b-main-info-title a').attr('href'),
                pubDate: date($(this).find('.b-main-createtime').text()),
                author: $(this).find('.b-author').text(),
            };
            return info;
        })
        .get();

    const second_part = $('.b-list li')
        .slice(0, 18)
        .map(function () {
            const info = {
                title: $(this).find('.b-item-title').text(),
                link: 'http://www.yystv.cn' + $(this).find('.b-item-title a').attr('href'),
                pubDate: date($(this).find('.fl').text()),
                author: $(this).find('.author-icon-list').text(),
            };
            return info;
        })
        .get();

    ctx.state.data = {
        title: '游研社-' + $('title').text(),
        link: 'http://www.yystv.cn/b/recommend',
        item: first_part.concat(second_part),
    };
};
