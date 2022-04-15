const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');

const host = 'http://www.cs.sdu.edu.cn/';
const typelist = ['学院公告', '学术报告', '新闻动态'];
const urlList = ['index/xygg.htm', 'xwgg/xsbg.htm', 'xwgg/xyxw.htm'];

module.exports = async (ctx) => {
    const type = parseInt(ctx.params.type) || 0;
    const link = url.resolve(host, urlList[type]);

    const response = await got.get(link);

    const $ = cheerio.load(response.data);

    const dateDict = {};
    const list = $('.sub_text .news-list')
        .slice(0, 10)
        .map((i, e) => {
            const divs = $(e).children();
            const tlink = 'http://www.cs.sdu.edu.cn/' + $('a', divs[1]).attr('href').substring(3);
            dateDict[tlink] = new Date($(divs[2]).text()).toUTCString();
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
                title: $('#newsTitle').text().trim(),
                author: '山东大学计算机科学与技术学院',
                description: $('.v_news_content').html(),
                pubDate: dateDict[itemUrl],
                link: itemUrl,
            };
            ctx.cache.set(itemUrl, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: `山东大学计算机科学与技术学院${typelist[type]}通知`,
        link,
        item: out,
    };
};
