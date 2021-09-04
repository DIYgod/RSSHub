const got = require('@/utils/got');
const cheerio = require('cheerio');
const resolve_url = require('url').resolve;

const base_url = 'http://www.hubu.edu.cn/index';

const map = {
    zhxw: '/zhxw.htm',
    hdyw: '/hdyw.htm',
    tzgg: '/tzgg.htm',
    xsxzxs: '/xsxzxs.htm',
    mthd: '/mthd.htm',
};

module.exports = async (ctx) => {
    const type = ctx.params.type;
    const link = `${base_url}${map[type]}`;
    const date = new Date();

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
        item: $('.list>ul>li')
            .slice(0, 10)
            .map((_, elem) => ({
                link: resolve_url(link, $('a', elem).attr('href')),
                title: $('a', elem).text(),
                pubDate:
                    new Date(`${date.getFullYear()}-${$('span.food-time', elem).text()}`) > date
                        ? new Date(`${date.getFullYear() - 1}-${$('span.food-time', elem).text()}`).toUTCString()
                        : new Date(`${date.getFullYear()}-${$('span.food-time', elem).text()}`).toUTCString(),
            }))
            .get(),
    };
};
