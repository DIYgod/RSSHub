const axios = require('../../utils/axios');
const cheerio = require('cheerio');
const resolve_url = require('url').resolve;

const base_url = 'http://jwc.njust.edu.cn/';

const map = {
    all: '/',
    T_Notices: '/1216/list.htm',
    S_Notices:'/1217/list.htm',
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
        title: $('title').text(),
        item: $('.pg-list>ul>li')
            .map((_, elem) => ({
                link: resolve_url(link, $('a', elem).attr('href')),
                title: $('a', elem).text(),
                pubDate: new Date($('span.food-time', elem).text()).toUTCString(),
            }))
            .get(),
    };
};
