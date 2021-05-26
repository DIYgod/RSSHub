const got = require('@/utils/got');
const cheerio = require('cheerio');

const baseUrl = 'http://jwc.cqu.edu.cn';

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'http://jwc.cqu.edu.cn/announcement',
        headers: {
            Referer: 'http://jwc.cqu.edu.cn/',
        },
    });

    const data = response.data;
    const $ = cheerio.load(data);
    const links = $('.views-row a')
        .slice(0, 5)
        .map((index, item) => {
            item = $(item);
            return {
                title: item.text(),
                link: baseUrl + item.attr('href'),
            };
        })
        .get();

    const items = await Promise.all(
        [...links].map(async ({ title, link }) => {
            const item = {
                title: title,
                link: link,
            };
            const cache = await ctx.cache.get(link);
            if (cache) {
                return JSON.parse(cache);
            }
            const response = await got({
                method: 'get',
                url: link,
            });
            const $ = cheerio.load(response.data);
            item.author = $('.username').text();
            item.pubDate = $('time').attr('datetime');
            item.description = $('div .field-items').html() && $('div .field-items').find('p').text();
            ctx.cache.set(item.link, JSON.stringify(item));
            return Promise.resolve(item);
        })
    );
    ctx.state.data = {
        title: '重庆大学教务处通知公告',
        link: 'http://jwc.cqu.edu.cn/announcement',
        item: items.filter((x) => x),
    };
};
