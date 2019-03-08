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
    const list = $('.paragraph li')
        .splice(0, 10)
        .map((i, e) => ({
            path: $('span span a', e).attr('href'),
            title: $('span span a', e).text(),
            author: $('div a', e)
                .attr('hreflang', 'zh-hans')
                .text(),
        }))
        .get();

    const out = await Promise.all(
        list.map(async (item) => {
            const { path, title, author } = item;
            const link = host + path;

            const cache = await ctx.cache.get(link);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const response = await axios.get(link);

            if (response.request.res.connection._host === 'ids.hit.edu.cn') {
                const single = {
                    pubDate: new Date(
                        link
                            .split('/')
                            .slice(-4, -1)
                            .join('-')
                    ).toUTCString(),
                    author: author,
                    link: link,
                    title: title,
                    description: '请进行统一身份认证后查看全文',
                };
                ctx.cache.set(link, JSON.stringify(single), 24 * 60 * 60);
                return Promise.resolve(single);
            }

            const $ = cheerio.load(response.data);
            const single = {
                pubDate: new Date($('.left-attr.first').text()).toUTCString(),
                author: author,
                link: link,
                title: title,
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
