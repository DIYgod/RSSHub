const got = require('@/utils/got');
const cheerio = require('cheerio');
const baseUrl = 'https://wen.woshipm.com';
const { parseRelativeDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const response = await got(`${baseUrl}/m/main/indexNewData.html`);
    const $ = cheerio.load(response.data);
    const postList = $('.article-list-item')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('.went-head-text').text(),
                link: `${baseUrl}${item.find('.went-head').attr('href')}`,
                pubDate: parseRelativeDate(item.find('.list-text').text().split('|')[1]),
            };
        });

    const result = await Promise.all(
        postList.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const temp = await got(item.link);
                const $ = cheerio.load(temp.data);
                item.description = $('.wt-desc').html();
                return item;
            })
        )
    );

    ctx.state.data = {
        title: '天天问 - 人人都是产品经理',
        link: baseUrl,
        item: result,
    };
};
