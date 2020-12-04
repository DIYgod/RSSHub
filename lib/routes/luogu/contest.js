const got = require('@/utils/got');
const cheerio = require('cheerio');
const resolve_url = require('url').resolve;

module.exports = async (ctx) => {
    const link = 'https://www.luogu.com.cn/';
    const response = await got.get(link);
    const $ = cheerio.load(response.data);
    const title = '洛谷近期比赛';

    const out = $('.am-panel-hd ')
        .slice(0, 10)
        .map(function () {
            const info = {
                title: $(this).find('a').text() || $(this).text(),
                description: $(this).html() + $(this).parent().find('.am-panel-bd').html(),
                link: resolve_url('https://www.luogu.com.cn', $(this).find('a').attr('href')),
            };
            return info;
        })
        .get();

    ctx.state.data = {
        title: title,
        link: link,
        item: out,
    };
};
