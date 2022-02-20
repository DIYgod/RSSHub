const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const category = ctx.params.category ?? 'xw';

    const rootUrl = 'http://bs.bnu.edu.cn';
    const currentUrl = `${rootUrl}/${category}/index.html`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('a[title]')
        .map((_, item) => {
            item = $(item);

            return {
                title: item.attr('title'),
                pubDate: parseDate(item.prev().text()),
                link: `${rootUrl}/${category}/${item.attr('href')}`,
            };
        })
        .get();

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = cheerio.load(detailResponse.data);

                item.description = content('.right-c-content-con').html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `${$('.right-c-title').text()} - ${$('title').text()}`,
        link: currentUrl,
        item: items,
    };
};
