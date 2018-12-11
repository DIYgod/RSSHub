const axios = require('../../../../utils/axios');
const cheerio = require('cheerio');
const url = require('url');

const host = 'http://cs.nuaa.edu.cn/';

module.exports = async (ctx) => {
    const link = url.resolve(host, '1975/list.htm');
    const response = await axios.get(link);
    const $ = cheerio.load(response.data);

    const list = $('tr.section')
        .slice(0, 10)
        .map(function() {
            const info = {
                title: $(this)
                    .find('td:nth-child(2) a')
                    .attr('title'),
                link: $(this)
                    .find('td:nth-child(2) a')
                    .attr('href'),
                date: $(this)
                    .find('td:nth-child(3)')
                    .text(),
            };
            return info;
        })
        .get();

    const out = await Promise.all(
        list.map(async (info) => {
            const title = info.title;
            const date = info.date;
            const itemUrl = url.resolve(host, info.link);

            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const response = await axios.get(itemUrl);
            const $ = cheerio.load(response.data);

            const single = {
                title: title,
                link: itemUrl,
                description: $('.wp_articlecontent')
                    .html()
                    .replace(/src="\//g, `src="${url.resolve(host, '.')}`)
                    .trim(),
                pubDate: new Date(date),
            };
            ctx.cache.set(itemUrl, JSON.stringify(single), 24 * 60 * 60);
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: '南航计算机科学与技术学院学术讲座',
        link: link,
        description: '南航计算机科学与技术学院学术讲座RSS',
        item: out,
    };
};
