const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');

const host = 'http://jwc.njust.edu.cn/';

const map = new Map([
    [1, { title: '南京理工大学教务处 -- 教师通知', id: 'wp_news_w12' }],
    [2, { title: '南京理工大学教务处 -- 学生通知', id: 'wp_news_w13' }],
    [3, { title: '南京理工大学教务处 -- 新闻', id: 'wp_news_w14' }],
    [4, { title: '南京理工大学教务处 -- 学院动态', id: 'wp_news_w15' }],
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
