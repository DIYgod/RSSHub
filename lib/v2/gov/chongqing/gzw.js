const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const { category = 'tzgg_191' } = ctx.params;
    const limit = ctx.query.limit ? parseInt(ctx.query.limit, 10) : 15;

    const rootUrl = 'https://gzw.cq.gov.cn';
    const currentUrl = new URL(category, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = cheerio.load(response);

    let items = $('ul.tab-item li.clearfix')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            const a = item.find('a');

            return {
                title: a.text(),
                link: new URL(a.prop('href').replace(/^\./, category), rootUrl).href,
                pubDate: parseDate(item.find('span').text()),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link);

                const content = cheerio.load(detailResponse);

                item.title = content('meta[name="ArticleTitle"]').prop('content');
                item.description = content('div.trs_paper_default').html();
                item.author = content('meta[name="ContentSource"]').prop('content');
                item.category = content('meta[name="Keywords"]')
                    .prop('content')
                    .split(/;/)
                    .filter((c) => c);
                item.pubDate = timezone(parseDate(content('meta[name="PubDate"]').prop('content')), +8);

                return item;
            })
        )
    );

    const icon = new URL('favicon.ico', rootUrl).href;

    ctx.state.data = {
        item: items,
        title: `${$('title').text()} - ${$('meta[name="ColumnName"]').prop('content')}`,
        link: currentUrl,
        description: $('meta[name="ColumnDescription"]').prop('content'),
        language: $('html').prop('lang'),
        image: new URL($('div.logo img').prop('src'), rootUrl).href,
        icon,
        logo: icon,
        subtitle: $('meta[name="ColumnKeywords"]').prop('content'),
        author: $('meta[name="SiteName"]').prop('content'),
        allowEmpty: true,
    };
};
