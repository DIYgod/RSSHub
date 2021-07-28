const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');

const host = 'http://sist.shanghaitech.edu.cn/';

module.exports = async (ctx) => {
    const link = url.resolve(host, 'cn/News.asp?mid=102');
    const response = await got.get(link);

    const $ = cheerio.load(response.data);

    const list = $('.pagebv tr')
        .slice(0, 10)
        .map((i, e) => ({
            link: $(e).find('td:nth-of-type(2) a').attr('href'),
            date: $(e).find('td:last-of-type').text().replace('[', '').replace(']', ''),
        }))
        .get();

    const out = await Promise.all(
        list.map(async (item) => {
            const itemUrl = url.resolve(host, `cn/${item.link}`);
            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const response = await got.get(itemUrl);
            const $ = cheerio.load(response.data);
            const single = {
                title: $('.pagebv tr:first-of-type').text().trim(),
                link: itemUrl,
                author: '上海科技大学信息科技与技术学院',
                description: $('.pagebv tr:last-of-type')
                    .html()
                    .replace(/src="\//g, `src="${url.resolve(host, '.')}`)
                    .trim(),
                pubDate: new Date(item.date),
            };
            ctx.cache.set(itemUrl, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: '上海科技大学信息科技与技术学院 -- 活动',
        link,
        item: out,
    };
};
