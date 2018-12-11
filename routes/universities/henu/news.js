const axios = require('../../../utils/axios');
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

    const response = await axios({
        method: 'get',
        url: link,
        headers: {
            Referer: link,
        },
    });

    const $ = cheerio.load(response.data);

    ctx.state.data = {
        link: link,
        title: $('tit1').text(),
        item: $('.list>td')
            .map((_, elem) => ({
                link: resolve_url(link, $('a', elem).attr('href')),
                title: $('a', elem).text(),
                pubDate: new Date($('span.food-time', elem).text()).toUTCString(),
            }))
            .get(),
    };
};
