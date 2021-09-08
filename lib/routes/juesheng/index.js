const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await got('http://www.juesheng.com/');
    const $ = cheerio.load(response.data);
    const postList = $('.sec-box #informationBox li').get();
    const result = await Promise.all(
        postList.map(async (item) => {
            const title = $(item).find('.news-item-title').find('a').text();
            const link = $(item).find('.news-item-title').find('a').attr('href');
            const guid = link;

            const single = {
                title,
                link,
                guid,
                pubDate: '',
                description: '',
            };

            const description_key = 'juesheng_description_' + guid;
            const description_value = await ctx.cache.get(description_key);

            const pubDate_key = 'juesheng_pubDate_' + guid;
            const pubDate_value = await ctx.cache.get(pubDate_key);

            if (description_value && pubDate_value) {
                single.description = description_value;
                single.pubDate = pubDate_value;
            } else {
                const temp = await got(link);
                single.description = $(temp.data).find('.content-box').html();
                single.pubDate = new Date($(temp.data).find('.part-time').text()).toUTCString();

                ctx.cache.set(description_key, single.description);
                ctx.cache.set(pubDate_key, single.pubDate);
            }

            return Promise.resolve(single);
        })
    );
    ctx.state.data = {
        title: '决胜网',
        link: 'http://www.juesheng.com/',
        description: '决胜网是教育产业门户网站提供：教育门户新闻资讯、互联网+教育、在线教育、兴趣教育、在线职业教育、教育创业、教育信息化、教育创业报道等，找教育就上决胜网教育门户网站。',
        item: result,
    };
};
