const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');

const host = 'http://yzb.seu.edu.cn/';

const map = new Map([
    [1, { title: '东南大学研究生招生网 -- 硕士招生', id: 'wp_news_w11' }],
    [2, { title: '东南大学研究生招生网 -- 博士招生', id: 'wp_news_w12' }],
    [3, { title: '东南大学研究生招生网 -- 港澳台及中外合作办学', id: 'wp_news_w103' }],
]);

module.exports = async (ctx) => {
    const type = Number.parseInt(ctx.params.type);
    const response = await got.get(host);

    const $ = cheerio.load(response.data);

    const id = map.get(type).id;

    const items = $(`#${id} tr tr`)
        .slice(0, 10)
        .map((_, elem) => {
            const a = $('td:first-child > a', elem);
            return {
                link: url.resolve(host, a.attr('href')),
                title: a.attr('title'),
                pubDate: new Date($('td:nth-child(2)', elem).text()).toUTCString(),
            };
        })
        .get();

    ctx.state.data = {
        link: host,
        title: map.get(type).title,
        item: items,
    };
};
