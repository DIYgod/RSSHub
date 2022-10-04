const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const rootUrl = 'http://i.jandan.net';

    const response = await got({
        method: 'get',
        url: rootUrl,
    });

    const $ = cheerio.load(response.data);

    let items = $('.post')
        .slice(0, ctx.query.limit ? parseInt(ctx.query.limit) : 15)
        .toArray()
        .map((item) => {
            item = $(item);

            const a = item.find('.thetitle a');

            return {
                title: a.text(),
                link: a.attr('href'),
                description: art(path.join(__dirname, 'templates/description.art'), {
                    summary: item.find('.indexs').text(),
                    image: item
                        .find('img')
                        .attr('data-original')
                        .replace(/!square/, ''),
                }),
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

                content('.wechat-hide').prev().nextAll().remove();

                item.description += content('.entry').html();
                item.author = content('.postinfo strong').text();
                item.pubDate = timezone(parseDate(detailResponse.data.match(/"pubDate": "(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})"/)[1]), +8);

                return item;
            })
        )
    );

    ctx.state.data = {
        title: $('title').text(),
        link: rootUrl,
        item: items,
    };
};
