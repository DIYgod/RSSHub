const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');

const host = 'http://cwc.njust.edu.cn/';

const map = new Map([
    [1, { title: '南京理工大学财务处 -- 新闻及通知', id: 'wp_news_w2' }],
    [2, { title: '南京理工大学财务处 -- 办事指南', id: 'wp_news_w3' }],
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
