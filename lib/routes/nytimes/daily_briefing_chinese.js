const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

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
        post.map(
            async (item) =>
                await ctx.cache.tryGet(item.link, async () => {
                    const response = await got.get(item.link);
                    const $ = cheerio.load(response.data);
                    $('.css-pncxxs.etfikam0').remove();
                    $('.css-1xdhyk6.erfvjey0').each((_, item) => {
                        item = $(item);
                        const link = item.find('img').attr('src');
                        item.replaceWith(`<img src="${link}">`);
                    });
                    item.description = $('.meteredContent.css-1r7ky0e').html();
                    const date = $('.css-x7rtpa.e16638kd0').attr('datetime');
                    item.pubDate = parseDate(date);
                    return item;
                })
        )
    );

    ctx.state.data = {
        title: '纽约时报中文网|新闻简报',
        link: url,
        item: items,
    };
};
