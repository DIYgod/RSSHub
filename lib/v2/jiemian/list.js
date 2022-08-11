const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const id = ctx.params.id ?? '4';

    const rootUrl = 'https://www.jiemian.com';
    const currentUrl = `${rootUrl}/lists/${id}.html`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    let items = $('.card-list__content, .columns-right-center__newsflash-content')
        .slice(0, ctx.query.limit ? parseInt(ctx.query.limit) : 15)
        .toArray()
        .map((item) => {
            item = $(item).find('a');

            return {
                title: item.text(),
                link: item.attr('href'),
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

                const pubDate = content('.date').attr('data-article-publish-time');
                const timeMatches = content('.article-info')
                    .text()
                    .match(/\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}/);

                item.description = content('.article-content').html();
                item.author = content('.article-info .author').first().text().replace(/·/, '').trim();
                item.pubDate = timeMatches ? timezone(parseDate(timeMatches[1]), +8) : parseDate(pubDate * 1000);

                return item;
            })
        )
    );

    ctx.state.data = {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
};
