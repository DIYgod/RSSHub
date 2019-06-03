const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');

const listUrl = 'https://it.swufe.edu.cn/index/';
const baseUrl = 'https://it.swufe.edu.cn/';

const map = new Map([['xyxw', { title: '西南财经大学经济信息工程学院 -- 学院新闻', suffix: 'xyxw.htm' }], ['tzgg', { title: '西南财经大学经济信息工程学院 -- 通知公告', suffix: 'tzgg.htm' }]]);

module.exports = async (ctx) => {
    const type = ctx.params.type || 'tzgg';
    const suffix = map.get(type).suffix;

    const link = listUrl + suffix;
    const response = await got.get(link);

    const data = response.data;
    const $ = cheerio.load(data);

    const list = $('div[class="article-list"] ul li a')
        .slice(0, 10)
        .map(function() {
            const info = {
                link: $(this)
                    .attr('href')
                    .slice(2),
                title: $(this)
                    .children('span')
                    .first()
                    .text(),
                date: $(this)
                    .children('span')
                    .last()
                    .text(),
            };
            return info;
        })
        .get();

    const out = await Promise.all(
        list.map(async (info) => {
            const title = info.title;
            const date = info.date;
            const itemUrl = url.resolve(baseUrl, info.link);

            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const response = await got.get(itemUrl);
            const $ = cheerio.load(response.data);

            const single = {
                title: title,
                link: itemUrl,
                description: $('.article-main')
                    .html()
                    .replace(/src="\//g, `src="${url.resolve(baseUrl, '.')}`)
                    .trim(),
                pubDate: new Date(date).toUTCString(),
            };
            ctx.cache.set(itemUrl, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: map.get(type).title,
        link: link,
        description: '西南财经大学经济信息工程学院RSS',
        item: out,
    };
};
