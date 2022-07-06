const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const category = ctx.params.category ?? '';

    const rootUrl = 'http://std.xjtu.edu.cn';
    const currentUrl = `${rootUrl}/tzgg${category ? `/${category}` : ''}.htm`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    let items = $('.c1017')
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.text(),
                link: `${rootUrl}/${item.attr('href')}`,
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

                item.description = art(path.join(__dirname, 'templates/std.art'), {
                    description: content('#vsb_newscontent').html(),
                    attachments: content('#vsb_newscontent').parent().next().next().next().html(),
                });
                item.pubDate = timezone(parseDate(content('#vsb_newscontent').parent().prev().prev().text().split('&nbsp')[0], 'YYYY年MM月DD日 HH:mm'), +8);

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
