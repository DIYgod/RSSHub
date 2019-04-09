const axios = require('../../../../utils/axios');
const cheerio = require('cheerio');
const url = require('url');

const host = 'http://www.sim.cas.cn/';

module.exports = async (ctx) => {
    const link = url.resolve(host, 'xwzx2016/xshd2016/');
    const response = await axios.get(link);

    const $ = cheerio.load(response.data);

    const list = $('.list-news li')
        .slice(0, 10)
        .map((i, e) =>
            $(e).children().length > 0
                ? {
                      link: $(e)
                          .find('a')
                          .attr('href'),
                      date: $(e)
                          .find('span')
                          .text()
                          .replace('[', '')
                          .replace(']', ''),
                  }
                : null
        )
        .get();

    const out = await Promise.all(
        list.map(async (item) => {
            const itemUrl = url.resolve(link, item.link);
            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const response = await axios.get(itemUrl);
            const $ = cheerio.load(response.data);

            const author = $('.qtinfo.hidden-lg.hidden-md.hidden-sm').text();
            const reg = new RegExp('文章来源：(.*?)\\|', 'g');

            const single = {
                title: $('p.wztitle')
                    .text()
                    .trim(),
                link: itemUrl,
                author: reg
                    .exec(author)[1]
                    .toString()
                    .trim(),
                description: $('.TRS_Editor')
                    .html()
                    .replace(/src=".\//g, `src="${url.resolve(itemUrl, '.')}`)
                    .trim(),
                pubDate: new Date(item.date).toUTCString(),
            };
            ctx.cache.set(itemUrl, JSON.stringify(single), 24 * 60 * 60);
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: '中国科学院上海微系统与信息技术研究所 -- 学术活动',
        link,
        item: out,
    };
};
