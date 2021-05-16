const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const rootUrl = 'https://bioone.org';
    const response = await got({
        method: 'get',
        url: rootUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('.items h4 a')
        .slice(0, 10)
        .map((_, item) => {
            item = $(item);
            const link = item.attr('href');

            return {
                title: item.text(),
                link: link.indexOf('http') < 0 ? `${rootUrl}${link}` : link,
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

                    item.description = content('#divARTICLECONTENTTop').html();
                    item.doi = content('meta[name="dc.Identifier"]').attr('content');
                    item.pubDate = new Date(content('meta[name="dc.Date"]').attr('content')).toUTCString();

                    return item;
                })
        )
    );

    ctx.state.data = {
        title: 'Featured articles - BioOne',
        link: rootUrl,
        item: items,
    };
};
