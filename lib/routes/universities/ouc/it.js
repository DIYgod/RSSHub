const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');

const host = 'https://it.ouc.edu.cn/';
const typelist = ['学院要闻', '学院公告', '学术活动'];
const urlList = ['xyyw/list.psp', 'xygg/list.psp', 'xshd/list.psp'];

module.exports = async (ctx) => {
    const type = parseInt(ctx.params.type) || 0;
    const link = url.resolve(host, urlList[type]);
    const response = await got.get(link);
    const $ = cheerio.load(response.data);

    const dateDict = {};
    const list = $('#wp_news_w33')
        .find('li')
        .slice(0, 9)
        .map((i, e) => {
            const divs = $(e).children();
            const tlink = host + divs.find('a')[0].attribs.href.substring(1);
            dateDict[tlink] = new Date($($(divs.children()[0]).find('p')[0]).text()).toUTCString();
            return tlink;
        })
        .get();
    const out = await Promise.all(
        list.map(async (itemUrl) => {
            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }
            const response = await got.get(itemUrl);
            const $ = cheerio.load(response.data);

            const single = {
                title: $('.content-tittle')
                    .text()
                    .trim(),
                author: '中国海洋大学信息科学与工程学院',
                description: $('.wp_articlecontent').html(),
                pubDate: dateDict[itemUrl],
                link: itemUrl,
            };
            ctx.cache.set(itemUrl, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: `中国海洋大学信息科学与工程学院${typelist[type]}`,
        link,
        item: out,
    };
};
