const axios = require('../../../../utils/axios');
const cheerio = require('cheerio');
const url = require('url');

const host = 'http://radio.seu.edu.cn/';

module.exports = async (ctx) => {
    const link = url.resolve(host, '_s29/15986/list.psp');
    const response = await axios.get(link);

    const $ = cheerio.load(response.data);

    const list = $('.Article_Title a')
        .slice(0, 10)
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
                title: $('.arti_title').text(),
                link: itemUrl,
                author: $('.arti_publisher')
                    .text()
                    .replace('发布者：', ''),
                description: $('.wp_articlecontent')
                    .html()
                    .replace(/src="\//g, `src="${url.resolve(host, '.')}`)
                    .trim(),
                pubDate: new Date(
                    $('.arti_update')
                        .text()
                        .replace('发布时间：', '')
                ),
            };
            ctx.cache.set(itemUrl, JSON.stringify(single), 24 * 60 * 60);
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: '东南大学信息科学与工程学院 -- 学术活动',
        link,
        item: out,
    };
};
