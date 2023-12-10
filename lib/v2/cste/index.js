const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const id = ctx.params.id ?? '16';
    const limit = ctx.query.limit ? parseInt(ctx.query.limit) : 10;

    const rootUrl = 'https://www.cste.org.cn';
    const currentUrl = `${rootUrl}/site/term/${id}.html`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    let items = $('a.list-group-item')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.find('h5').text(),
                link: `${rootUrl}${item.attr('href')}`,
                pubDate: parseDate(item.find('small').text()),
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

                content('.Next').remove();

                item.description = content('.article').html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `中国技术经济学会 - ${$('.leftTop').text()}`,
        link: currentUrl,
        item: items,
    };
};
