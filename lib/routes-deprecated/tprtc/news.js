const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');

module.exports = async (ctx) => {
    const pagelink = 'http://www.tprtc.com/page/channel/news?id=89';
    const host = 'http://www.tprtc.com';

    const response = await got({
        method: 'get',
        url: pagelink,
        headers: {
            Referer: 'http://www.tprtc.com',
            'Accept-Encoding': 'gzip, deflate',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        },
    });

    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('.news_list li').get();

    const ProcessFeed = async (link) => {
        const response = await got({
            method: 'get',
            url: link,
            headers: {
                Referer: pagelink,
                'Accept-Encoding': 'gzip, deflate',
                'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            },
        });
        const $ = cheerio.load(response.data);

        return $('.new_detail_cont').html();
    };

    const items = await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);

            const $title = $('a');
            const itemUrl = url.resolve(host, $title.attr('href'));

            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return JSON.parse(cache);
            }

            const description = await ProcessFeed(itemUrl);

            const single = {
                title: $title.attr('title'),
                link: itemUrl,
                description,
                pubDate: new Date($('.news_time').text()).toUTCString(),
            };

            ctx.cache.set(itemUrl, JSON.stringify(single));
            return single;
        })
    );

    ctx.state.data = {
        title: '新闻动态-天津产权交易中心',
        link: pagelink,
        description: '天津产权交易中心-新闻动态',
        item: items,
    };
};
