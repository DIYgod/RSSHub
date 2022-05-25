const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate, parseRelativeDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const category = ctx.params.category ?? 'all';
    const state = ctx.params.state ?? '';

    const rootUrl = 'https://getquicker.net';
    const currentUrl = `${rootUrl}/QA${category !== 'all' ? `?category=${category}` : ''}${state ? `?state=${state}` : ''}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    let items = $('a.question-title')
        .slice(0, ctx.query.limit ? parseInt(ctx.query.limit) : 25)
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.text(),
                link: `${rootUrl}${item.attr('href')}`,
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

                content('div[data-note="最后更新人信息"]').remove();

                const pubDate = content('.info-text')
                    .first()
                    .text()
                    .replace(/创建于 /, '')
                    .trim();

                item.description = content('.topic-body').html();
                item.author = content('.user-link').first().text();
                item.pubDate = timezone(/-/.test(pubDate) ? parseDate(pubDate) : parseRelativeDate(pubDate), +8);

                return item;
            })
        )
    );

    ctx.state.data = {
        title: $('title').text(),
        link: currentUrl,
        item: items,
        allowEmpty: true,
    };
};
