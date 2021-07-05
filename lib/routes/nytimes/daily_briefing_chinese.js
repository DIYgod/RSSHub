const got = require('@/utils/got');
const cheerio = require('cheerio');
const utils = require('./utils');

module.exports = async (ctx) => {
    const url = 'https://www.nytimes.com/zh-hans/series/daily-briefing-chinese';
    const response = await got({
        method: 'get',
        url,
    });
    const data = response.data;
    const $ = cheerio.load(data);
    const post = $('.css-13mho3u .css-ye6x8s')
        .map((index, elem) => {
            const $item = $(elem);
            const $link = $item.find('a');
            const $title = $item.find('h2');

            return {
                title: $title.text(),
                link: 'https://www.nytimes.com' + $link.attr('href'),
            };
        })
        .get();

    const items = await Promise.all(
        post.map(async (item) => {
            const link = item.link;

            const result = await ctx.cache.tryGet(`nyt: ${link}`, async () => {
                const response = await got.get(link);

                const data = response.data;
                const result = utils.ProcessFeed(data);
                const $ = cheerio.load(data);
                result.description = $('.meteredContent').html();
                return result;
            });
            item.pubDate = result.pubDate;
            item.description = result.description;

            return Promise.resolve(item);
        })
    );

    ctx.state.data = {
        title: '纽约时报中文网|新闻简报',
        link: url,
        item: items,
    };
};
