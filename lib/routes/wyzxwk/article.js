const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const parseDate = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const rootUrl = 'http://www.wyzxwk.com';
    const currentUrl = `${rootUrl}/Article/${id}`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('h3 a')
        .slice(0, 15)
        .map((_, item) => {
            item = $(item);
            return {
                title: item.text(),
                link: item.attr('href'),
            };
        })
        .get();

    const items = await Promise.all(
        list.map(
            async (item) =>
                await ctx.cache.tryGet(item.link, async () => {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.link,
                    });
                    const content = cheerio.load(detailResponse.data);

                    content('.m-weixincode').remove();

                    const pubDate = detailResponse.data.match(/<span class="s-grey-3">(\d{4}-\d{2}-\d{2})<\/span>/);

                    if (pubDate) {
                        item.pubDate = timezone(parseDate(pubDate[1], 'YYYY-MM-DD'), +8);
                    }

                    item.description = content('article').html();

                    return item;
                })
        )
    );

    ctx.state.data = {
        title: `${$('h2').eq(0).text()} - 乌有之乡网刊`,
        link: currentUrl,
        item: items,
    };
};
