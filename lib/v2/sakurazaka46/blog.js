const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const id = ctx.params.id ?? '';

    const rootUrl = 'https://sakurazaka46.com';
    const currentUrl = `${rootUrl}/s/s46/diary/blog/list${id ? `?ct=${id}` : ''}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    let items = $('.com-blog-part .box a')
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.text(),
                author: item.find('.name').text(),
                link: `${rootUrl}${item.attr('href').split('?')[0]}`,
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

                item.description = content('.box-article').html();
                item.pubDate = timezone(parseDate(content('.blog-foot .date').text()), +9);

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `${$('title').text()}${id ? ` - ${$('.name').first().text()}` : ''}`,
        link: currentUrl,
        item: items,
    };
};
