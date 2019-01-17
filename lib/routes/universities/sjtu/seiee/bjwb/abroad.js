const axios = require('../../../../../utils/axios');
const cheerio = require('cheerio');
const url = require('url');

const host = 'http://bjwb.seiee.sjtu.edu.cn';

module.exports = async (ctx) => {
    const link = url.resolve(host, `bkjwb/list/1507-1-20.htm`);
    const response = await axios.get(link);

    const $ = cheerio.load(response.data);

    const list = $('.list_box_5 li')
        .map((i, e) => ({
            date: $(e)
                .children('span')
                .text()
                .slice(1, -1),
            title: $(e)
                .children('a')
                .text()
                .slice(2),
            link: $(e)
                .children('a')
                .attr('href'),
        }))
        .get();

    const out = await Promise.all(
        list.map(async (item) => {
            const itemUrl = url.resolve(host, item.link);
            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const response = await axios.get(itemUrl);
            const $ = cheerio.load(response.data);

            const single = {
                title: item.title,
                link: itemUrl,
                author: '上海交通大学电子信息与电气工程学院本科教务办',
                description: $('.article_content').text(),
                pubDate: new Date(item.date).toUTCString(),
            };
            ctx.cache.set(itemUrl, JSON.stringify(single), 24 * 60 * 60);
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: '上海交通大学电子信息与电气工程学院本科教务办 -- 交换交流',
        link,
        item: out,
    };
};
