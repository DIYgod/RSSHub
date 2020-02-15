const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');
const host = 'http://www.graduate.nuaa.edu.cn/';
const getCookie = require('../utils/pypasswaf');

const map = {
    latest: '2146/list.htm',
    yyxw: 'yyxw/list.htm',
    sjwj: 'sjwj/list.htm',
    glwj: '2017/list.htm',
    xxfw: '2147/list.htm',
};

async function load(link, ctx, gotConfig) {
    const cache = await ctx.cache.get(link);
    if (cache) {
        return cache;
    }
    const response = await got.get(host + link, gotConfig);
    const $ = cheerio.load(response.data);
    const images = $('img');
    for (let k = 0; k < images.length; k++) {
        $(images[k]).replaceWith(`<img src="${url.resolve(host, $(images[k]).attr('src'))}" />`);
    }
    const description = $('.wp_articlecontent').html();
    ctx.cache.set(link, description);
    return { description };
}

module.exports = async (ctx) => {
    const cookie = await getCookie();

    const gotConfig = {
        headers: {
            cookie,
        },
    };
    const type = ctx.params.type || 'latest';
    const response = await got(
        {
            method: 'get',
            url: host + map[type],
        },
        gotConfig
    );
    const $ = cheerio.load(response.data);
    const list = $('#news_list > tbody > tr > td > table > tbody > tr:nth-child(1)')
        .slice(0, 10)
        .get();
    const process = await Promise.all(
        list.map(async (item) => {
            const a = $(item).find('td:nth-child(2) > a:nth-child(2)');
            const t = $(item).find('td:nth-child(3)');
            const itemUrl = a.attr('href');
            const single = {
                title: a.text(),
                link: url.resolve(host, itemUrl),
                guid: url.resolve(host, itemUrl),
                pubDate: t.text().slice(0, 10),
            };
            const other = await load(itemUrl, ctx, gotConfig);
            return Promise.resolve(Object.assign({}, single, other));
        })
    );

    ctx.state.data = {
        title: '南航研究生院',
        link: host,
        description: '南航研究生院RSS',
        item: process,
    };
};
