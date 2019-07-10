const got = require('@/utils/got');
const cheerio = require('cheerio');
const resolve_url = require('url').resolve;

const base_url = 'http://jwc.henu.edu.cn';

const map = {
    all: '/',
    xszl: '/jwzl/xszl.htm',
    jszl: '/jwzl/jszl.htm',
    xwgg: '/jwzl/xwgg.htm',
    ybdt: '/jwzl/ybdt.htm',
    gjqy: '/jwzl/gjqy.htm',
};

module.exports = async (ctx) => {
    const type = ctx.params.type || 'all';
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
        item: $('.list>tr')
            .slice(0, 10)
            .map((_, elem) => ({
                link: resolve_url(link, $('a', elem).attr('href')),
                title: $('tit1', elem).text(),
                pubDate: new Date($('time1.span', elem).text()).toUTCString(),
            }))
            .get(),
    };
};
