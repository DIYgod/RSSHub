const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const rootUrl = 'https://www.78dm.net';
    const currentUrl = `${rootUrl}${ctx.path === '/' ? '/news' : /\/[0-9]+$/.test(ctx.path) ? `${ctx.path}.html` : ctx.path}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    let items = $('.card-title')
        .slice(0, ctx.query.limit ? parseInt(ctx.query.limit) : 30)
        .toArray()
        .map((item) => {
            item = $(item);

            const link = item.attr('href');

            return {
                title: item.text(),
                link: /^\/\//.test(link) ? `https:${link}` : link,
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

                content('.tag, .level').remove();
                content('.lazy').each(function () {
                    content(this).replaceWith(
                        art(path.join(__dirname, 'templates/image.art'), {
                            image: content(this).attr('data-src'),
                        })
                    );
                });

                item.author = content('.push-username').first().text().split('楼主')[0];
                item.pubDate = timezone(
                    parseDate(
                        content('.push-time')
                            .first()
                            .text()
                            .match(/(\d{4}-\d{2}-\d{2} \d{2}:\d{2})/)[1]
                    ),
                    +8
                );
                item.description = content('.image-text-content').first().html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `78动漫 - ${$('title').text().split('_')[0]} - ${$('.actived').first().text()}`,
        link: currentUrl,
        item: items,
    };
};
