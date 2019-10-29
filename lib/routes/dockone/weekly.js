const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const baseUrl = 'http://weekly.dockone.io';
    const response = await got({
        method: 'get',
        url: baseUrl,
        headers: {
            Referer: baseUrl,
        },
    });

    const data = response.data;
    const $ = cheerio.load(data);
    const list = $('.aw-common-list .article').get();

    const ProcessFeed = (data) => {
        const $ = cheerio.load(data);

        // 提取内容
        return $('.aw-question-detail .content').html();
    };

    const items = await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);
            const $a = $('.aw-question-content > h4 > a');
            const link = $a.attr('href');

            const cache = await ctx.cache.get(link);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const response = await got({
                method: 'get',
                url: link,
            });

            const description = ProcessFeed(response.data);

            const single = {
                title: $a.text(),
                description,
                link: link,
                author: $('.aw-user-name').text(),
            };
            ctx.cache.set(link, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: 'DockOne.io',
        link: baseUrl,
        description: $('meta[name="description"]').attr('content') || $('title').text(),
        item: items,
    };
};
