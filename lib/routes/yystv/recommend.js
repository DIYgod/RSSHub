const got = require('@/utils/got');
const cheerio = require('cheerio');
const date = require('@/utils/date');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'http://www.yystv.cn/b/recommend',
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
        .slice(0, 8)
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
        title: '游研社-推游',
        link: 'http://www.yystv.cn/b/recommend',
        item: first_part.concat(second_part),
    };
};
