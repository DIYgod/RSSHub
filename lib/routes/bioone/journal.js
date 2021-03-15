const got = require('@/utils/got');
const cheerio = require('cheerio');
const date = require('@/utils/date');

module.exports = async (ctx) => {
    const journal = ctx.params.journal || 'acta-chiropterologica';

    const rootUrl = 'https://bioone.org';
    const currentUrl = `${rootUrl}/journals/${journal}/current`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('.TOCLineItemBoldText')
        .slice(0, 10)
        .map((_, item) => {
            item = $(item).parent();

            return {
                link: `${rootUrl}${item.attr('href')}`,
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

                    content('.ProceedingsArticleOpenAccessPanel').remove();
                    content('#divNotSignedSection, #rightRail').remove();

                    item.description = content('.panel-body').html();
                    item.title = content('meta[name="dc.Title"]').attr('content');
                    item.author = content('meta[name="dc.Creator"]').attr('content');
                    item.doi = content('meta[name="dc.Identifier"]').attr('content');
                    item.pubDate = date(content('meta[name="dc.Date"]').attr('content'));

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
