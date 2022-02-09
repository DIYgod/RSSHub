const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const id = ctx.params.id ?? 'shidai';

    const rootUrl = 'http://www.wyzxwk.com';
    const currentUrl = `${rootUrl}/Article/${id}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    let items = $('h3 a')
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.text(),
                link: item.attr('href'),
            };
        });

    items = await Promise.all(
        items.map(
            async (item) =>
                await ctx.cache.tryGet(item.link, async () => {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.link,
                    });
                    const content = cheerio.load(detailResponse.data);

                    content('.zs-modal-body').prev().nextAll().remove();

                    const pubDate = detailResponse.data.match(/<span class="s-grey-3">(\d{4}-\d{2}-\d{2})<\/span>/);

                    if (pubDate) {
                        item.pubDate = parseDate(pubDate[1], 'YYYY-MM-DD');
                    }

                    item.description = content('article').html();

                    return item;
                })
        )
    );

    ctx.state.data = {
        title: `${$('h2').first().text()} - 乌有之乡网刊`,
        link: currentUrl,
        item: items,
    };
};
