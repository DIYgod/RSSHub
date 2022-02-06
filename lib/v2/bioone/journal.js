const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const journal = ctx.params.journal ?? 'acta-chiropterologica';

    const rootUrl = 'https://bioone.org';
    const currentUrl = `${rootUrl}/journals/${journal}/current`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    let items = $('.TOCLineItemBoldText')
        .slice(0, ctx.query.limit ? parseInt(ctx.query.limit) : 10)
        .toArray()
        .map((item) => {
            item = $(item).parent();

            return {
                link: `${rootUrl}${item.attr('href')}`,
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

                    content('.ProceedingsArticleOpenAccessPanel').remove();
                    content('#divNotSignedSection, #rightRail').remove();

                    item.description = content('.panel-body').html();
                    item.title = content('meta[name="dc.Title"]').attr('content');
                    item.author = content('meta[name="dc.Creator"]').attr('content');
                    item.doi = content('meta[name="dc.Identifier"]').attr('content');
                    item.pubDate = parseDate(content('meta[name="dc.Date"]').attr('content'));

                    return item;
                })
        )
    );

    ctx.state.data = {
        title: `${response.data.match(/'journalpaper', '(.*)'\)\\" class=\\"/)[1]} - BioOne`,
        link: currentUrl,
        item: items,
    };
};
