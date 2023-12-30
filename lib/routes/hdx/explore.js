const got = require('@/utils/got');
const cheerio = require('cheerio');
const URL = require('url');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'https://www.huodongxing.com/eventlist',
    });

    const data = response.data;
    const $ = cheerio.load(data);

    const list = $('div.search-tab-content-item').get();

    const ProcessFeed = async (link) => {
        const response = await got({
            method: 'get',
            url: link,
        });
        const $ = cheerio.load(response.data);
        const content = $('#event_desc_page');

        return content.html();
    };

    const host = 'https://www.huodongxing.com';

    const items = await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);
            const $a = $('.item-title');
            const link = URL.resolve(host, $a.attr('href'));

            const cache = await ctx.cache.get(link);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const single = {
                title: $a.text(),
                description: await ProcessFeed(link),
                link,
                author: $('.user-name').text(),
            };

            ctx.cache.set(link, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: '活动行',
        link: 'https://www.huodongxing.com/eventlist',
        item: items,
    };
};
