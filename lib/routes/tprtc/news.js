const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'http://www.tprtc.com/InformationChannel/index.jhtml',
        headers: {
            Referer: 'http://www.tprtc.com',
            'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3793.0 Safari/537.36',
            'Accept-Encoding': 'gzip, deflate',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        },
    });

    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('.c1-bline').get();

    const ProcessFeed = async (link) => {
        const response = await got.get(link);
        const $ = cheerio.load(response.data);

        return $('.content').html();
    };

    const items = await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);

            const $title = $('.f-left>a:last-child');
            const itemUrl = $title.attr('href');

            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const description = await ProcessFeed(itemUrl);

            const single = {
                title: $('a.red').text() + ' ' + $title.attr('title'),
                link: itemUrl,
                description,
                author: $('a.red').text(),
            };

            ctx.cache.set(itemUrl, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: '新闻动态-天津产权交易中心',
        link: 'http://www.tprtc.com/InformationChannel/index.jhtml',
        description: '天津产权交易中心-新闻动态',
        item: items,
    };
};
