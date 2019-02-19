const axios = require('../../../utils/axios');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const host = 'http://today.hit.edu.cn';
    const category = ctx.params.category;

    const response = await axios({
        method: 'get',
        url: host + '/category/' + category,
        headers: {
            Referer: host,
        },
    });

    const $ = cheerio.load(response.data);
    const category_name = $('div.banner-title').text();
    const list = $('.paragraph li span span a')
        .map((i, e) => $(e).attr('href'))
        .get();

    const out = await Promise.all(
        list.map(async (item) => {
            const link = host + item;
            const cache = await ctx.cache.get(link);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }
            const response = await axios.get(link);
            const $ = cheerio.load(response.data);
            const single = {
                pubDate: new Date($('.left-attr.first').text()).toUTCString(),
                author: $('.bottom_misc span span a').text(),
                link: link,
                title: $('.article-title h3').text(),
                description: $('.article-content').text(),
            };

            ctx.cache.set(link, JSON.stringify(single), 24 * 60 * 60);
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: '今日哈工大-' + category_name,
        link: host + 'category/' + category,
        description: '今日哈工大-' + category_name,
        item: out,
    };
};
