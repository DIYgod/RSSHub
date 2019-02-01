const axios = require('../../../../utils/axios');
const cheerio = require('cheerio');
const url = require('url');

const host = 'http://www.seiee.sjtu.edu.cn/';

module.exports = async (ctx) => {
    const link = url.resolve(host, 'seiee/list/683-1-20.htm');
    const response = await axios.get(link);

    const $ = cheerio.load(response.data);

    const list = $('.list_style_1 li a')
        .map((i, e) => $(e).attr('href'))
        .get();

    const out = await Promise.all(
        list.map(async (itemUrl) => {
            itemUrl = url.resolve(host, itemUrl);
            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const response = await axios.get(itemUrl);
            const $ = cheerio.load(response.data);

            const single = {
                title: $('h2.title_3').text(),
                link: itemUrl,
                author: '上海交通大学电子信息与电气工程学院',
                description: $('.c_1.article_content')
                    .html()
                    .replace(/src="\//g, `src="${url.resolve(host, '.')}`),
                pubDate: new Date(
                    $('.date_1 span:first-of-type')
                        .text()
                        .trim()
                ).toUTCString(),
            };
            ctx.cache.set(itemUrl, JSON.stringify(single), 24 * 60 * 60);
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: '上海交通大学电子信息与电气工程学院 -- 学术动态',
        link,
        item: out,
    };
};
