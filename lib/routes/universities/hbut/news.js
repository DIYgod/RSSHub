const got = require('@/utils/got');
const cheerio = require('cheerio');
const resolve_url = require('url').resolve;

const base_url = 'https://www.hbut.edu.cn/xwzx';

const map = {
    tzgg: '/tzgg.htm',
    hgyw: '/hgyw.htm',
    xshd: '/xshd.htm',
    mthgd: '/mthgd.htm',
    zhxw: '/zhxw.htm',
    hggs: '/hggs.htm',
};

module.exports = async (ctx) => {
    const type = ctx.params.type;
    const link = `${base_url}${map[type]}`;

    const response = await got({
        method: 'get',
        url: link,
        headers: {
            Referer: link,
        },
    });

    const $ = cheerio.load(response.data);

    ctx.state.data = {
        link: link,
        title: $('title').text(),
        item: $('div.post.post1.post-14>div.con>ul.news_list>li')
            .slice(0, 10)
            .map((_, elem) => ({
                link: resolve_url(link, $('span.news_title>a', elem).attr('href')),
                title: $('a', elem).text(),
                pubDate: new Date(`${$('span.news_meta', elem).text()}`).toString(),
            }))
            .get(),
    };
};
