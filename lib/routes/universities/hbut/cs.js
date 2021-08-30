const got = require('@/utils/got');
const cheerio = require('cheerio');
const resolve_url = require('url').resolve;

const base_url = 'https://jsjxy.hbut.edu.cn';

const map = {
    xwdt: '/index/xwdt.htm',
    tzgg: '/index/tzgg.htm',
    jxxx: '/jxxx.htm',
    kydt: '/kxyj/kydt.htm',
    djhd: '/djhd/djhd.htm',
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
        link,
        title: $('title').text(),
        item: $('dl.nesw_list>dt')
            .slice(0, 10)
            .map((_, elem) => ({
                link: resolve_url(link, $('a', elem).attr('href')),
                title: $('a', elem).text(),
                pubDate: new Date(`${$('font:nth-child(3)', elem).text()}`).toString(),
            }))
            .get(),
    };
};
