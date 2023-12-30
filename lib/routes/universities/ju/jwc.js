const got = require('@/utils/got');
const cheerio = require('cheerio');
const resolve_url = require('url').resolve;

const base_url = 'http://jwc.jiangnan.edu.cn';

const map = {
    all: '/',
    tzgg: '/jwgl/tzgg.htm',
    ksap: '/jwgl/ksap.htm',
    wjgg: '/jwgl/wjgg.htm',
    tmgz: '/jwgl/tmgz.htm',
    djks: '/jwgl/djks.htm',
    xjgl: '/xjgl1.htm',
    bysj: '/sjjx/bysj.htm',
    syjx: '/sjjx/syjx.htm',
    sjcx: '/sjjx/sjcx.htm',
    xkjs: '/sjjx/xkjs.htm',
    yjszj: '/sjjx/yjszj.htm',
    jxgg: '/jxjs/jxgg.htm',
    zyjs: '/jxjs/zyjs.htm',
    kcjs: '/jxjs/kcjs.htm',
    jcjs: '/jxjs/jcjs.htm',
    jxcg: '/jxjs/jxcg.htm',
    xsbg: '/xsbg.htm',
};

module.exports = async (ctx) => {
    const type = ctx.params.type || 'all';
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
        link,
        title: $('title').text(),
        item: $('.pg-list>ul>li')
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
