const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');

const host = 'http://www.sc.sdu.edu.cn/';
const typelist = ['通知公告', '学术动态', '本科教育', '研究生教育'];
const urlList = ['tzgg.htm', 'kxyj/xsdt/2.htm', 'rcpy/bkjy.htm', 'rcpy/yjsjy.htm'];

module.exports = async (ctx) => {
    const type = parseInt(ctx.params.type) || 0;
    const link = url.resolve(host, urlList[type]);
    const response = await got.get(link);

    const $ = cheerio.load(response.data);

    const dateDict = {};
    const list = $('.lm_list li')
        .slice(0, 10)
        .map((i, e) => {
            let aLink = $(e).children('a').attr('href');
            // aLink = aLink.slice(3);
            aLink = url.resolve(host, aLink);
            const date = $(e).children('span').text().trim();
            dateDict[aLink] = date;
            return aLink;
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
                title: $('h1.c-title').text().trim(),
                link: itemUrl,
                author: '山东大学软件学院',
                description: $('.v_news_content').html(),
                pubDate: new Date(dateDict[itemUrl]),
            };
            ctx.cache.set(itemUrl, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: `山东大学软件学院${typelist[type]}`,
        link,
        item: out,
    };
};
