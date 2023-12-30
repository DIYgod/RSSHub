const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const rootUrl = 'https://database.caixin.com';
    const currentUrl = `${rootUrl}/news/`;
    const response = await got(currentUrl);

    const $ = cheerio.load(response.data);

    const list = $('h4 a')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.text(),
                link: item.attr('href').replace('http://', 'https://'),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link);
                const content = cheerio.load(detailResponse.data);

                item.pubDate = timezone(parseDate(content('#pubtime_baidu').text()), +8);
                item.description = art(path.join(__dirname, 'templates/article.art'), {
                    item,
                    $: content,
                });
                item.author = content('.top-author').text();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: '财新数据通 - 专享资讯',
        link: currentUrl,
        item: items,
    };
};
