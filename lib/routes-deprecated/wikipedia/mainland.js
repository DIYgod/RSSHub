const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const url = 'https://zh.wikipedia.org/wiki/Portal:%E4%B8%AD%E5%9C%8B%E5%A4%A7%E9%99%B8%E6%96%B0%E8%81%9E%E5%8B%95%E6%85%8B';

    const response = await got({
        method: 'get',
        url,
        headers: {
            'Accept-Language': 'zh-Hans;q=0.9,zh-Hant;q=0.8',
        },
    });

    const $ = cheerio.load(response.data);
    const items = $('#mw-content-text > div > table > tbody > tr:nth-child(1) > td > table:nth-child(3) > tbody > tr:nth-child(2) > td > div:nth-child(1) > ul > li').get().slice(0, 10);

    ctx.state.data = {
        title: '维基百科 - 中国大陆新闻动态',
        link: url,
        description: '维基百科 - 中国大陆新闻动态',
        item: items.map((item) => ({
            title: $(item).text(),
            desc: $(item).text(),
            link: url,
        })),
    };
};
