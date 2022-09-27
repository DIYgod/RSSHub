const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const rootUrl = 'https://www.fastbull.cn';
    const currentUrl = `${rootUrl}/news`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    let items = $('.trending_type')
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.find('.title').text(),
                link: `${rootUrl}${item.attr('href')}`,
                author: item.find('.resource').text(),
                description: item.find('.tips').text(),
                pubDate: parseDate(parseInt(item.find('.new_time').attr('data-date'))),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = cheerio.load(detailResponse.data);

                item.description = art(path.join(__dirname, 'templates/description.art'), {
                    tips: item.description,
                    description: content('.news-detail-content').html(),
                });

                return item;
            })
        )
    );

    ctx.state.data = {
        title: '财经头条、财经新闻、最新资讯 - FastBull',
        link: currentUrl,
        item: items,
    };
};
