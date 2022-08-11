const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate, parseRelativeDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const category = ctx.params.category;
    const id = ctx.params.id;

    const rootUrl = 'https://getquicker.net';
    const currentUrl = `${rootUrl}/User/${category}/${id}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    let items = $('table tbody tr')
        .slice(1, ctx.query.limit ? parseInt(ctx.query.limit) : 25)
        .toArray()
        .map((item) => {
            item = $(item).find('td a').first();

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

                content('section').last().remove();
                content('#app').children().slice(0, 2).remove();

                const pubDate = content('.text-secondary a').not('.text-secondary').first().text()?.trim().replace(/\s*/g, '') || content('div.note-text').find('span').eq(3).text();

                item.author = content('.user-link').first().text();
                item.description = content('div[data-info="动作信息"]').html() ?? content('#app').html() ?? content('.row').eq(1).html();
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
