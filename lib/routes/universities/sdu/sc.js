const axios = require('@/utils/axios');
const cheerio = require('cheerio');
const url = require('url');

const host = 'http://www.sc.sdu.edu.cn/';
const typelist = ['公告', '学术报告', '新闻动态'];
const urlList = ['index/xygg.htm', 'index/xsbg.htm', 'index/xwdt.htm'];

module.exports = async (ctx) => {
    const type = parseInt(ctx.params.type) || 0;
    const link = url.resolve(host, urlList[type]);
    const response = await axios.get(link);

    const $ = cheerio.load(response.data);

    const dateDict = {};
    const list = $('#div_more_news .leftNews')
        .slice(0, 10)
        .map((i, e) => {
            const divs = $(e).children();
            let c_link = $('a', divs[1]).attr('href');
            c_link = c_link.slice(3);
            c_link = url.resolve(host, c_link);
            const rawDate = $(divs[2]).text();
            const c_date = rawDate.slice(1, 5) + '-' + rawDate.slice(6, 8) + '-' + rawDate.slice(9, 11);
            dateDict[c_link] = c_date;
            return c_link;
        })
        .get();

    const out = await Promise.all(
        list.map(async (itemUrl) => {
            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const response = await axios.get(itemUrl);
            const $ = cheerio.load(response.data);

            const single = {
                title: $('#newsTitle')
                    .text()
                    .trim(),
                link: itemUrl,
                author: '山东大学软件学院',
                description: $('.newscontent-1').html(),
                pubDate: new Date(dateDict[itemUrl]),
            };
            ctx.cache.set(itemUrl, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: `山东大学软件学院${typelist[type]}通知`,
        link,
        item: out,
    };
};
