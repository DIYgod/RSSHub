const axios = require('@/utils/axios');
const cheerio = require('cheerio');
const utils = require('./utils');

module.exports = async (ctx) => {
    const url = 'https://zh.wikipedia.org/wiki/Portal:%E4%B8%AD%E5%9C%8B%E5%A4%A7%E9%99%B8%E6%96%B0%E8%81%9E%E5%8B%95%E6%85%8B';

    const response = await axios({
        method: 'get',
        url,
        headers: {
            'Accept-Language': 'zh-Hans;q=0.9,zh-Hant;q=0.8',
        },
    });

    const $ = cheerio.load(response.data);
    const full = $('#mw-content-text tr:nth-child(2) td:nth-child(1) td:nth-child(1)');
    const list = full.find('.mw-headline');
    const items = [];

    for (let i = 0; i < list.length - 1; i++) {
        const item = {
            title: $(list[i]).text(),
            desc: utils.ProcessLink(full.find(`ul:nth-of-type(${i + 1})`), 'zh'),
            url,
        };
        items.push(item);
    }

    ctx.state.data = {
        title: '维基百科 - 中国大陆新闻动态',
        link: url,
        description: '维基百科 - 中国大陆新闻动态',
        item: items.map((item) => ({
            title: item.title,
            description: item.desc,
            guid: item.title,
            link: item.url,
        })),
    };
};
