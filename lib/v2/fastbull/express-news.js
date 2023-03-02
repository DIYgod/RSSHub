const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const rootUrl = 'https://www.fastbull.cn';
    const currentUrl = `${rootUrl}/express-news`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const items = $('.news-list')
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.find('.title_name').text(),
                pubDate: parseDate(parseInt(item.attr('data-date'))),
                link: `${rootUrl}${item.find('.title_name').attr('href')}`,
            };
        });

    ctx.state.data = {
        title: '实时财经快讯 - FastBull',
        link: currentUrl,
        item: items,
    };
};
