const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const { category } = ctx.params;
    const limit = ctx.query.limit ? parseInt(ctx.query.limit, 10) : 25;

    const rootUrl = 'https://www.ndrc.gov.cn';
    const currentUrl = new URL(`fggz${category ? `/${category.endsWith('/') ? category : `${category}/`}` : '/'}`, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = cheerio.load(response);

    let items = $('ul.u-list li a')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.prop('title') || item.text(),
                link: new URL(item.prop('href'), currentUrl).href,
                pubDate: parseDate(item.next().text(), 'YYYY/MM/DD'),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link);

                const content = cheerio.load(detailResponse);

                item.title = content('meta[name="ArticleTitle"]').prop('content');
                item.description = content('div.TRS_Editor').html();
                item.author = content('meta[name="ContentSource"]').prop('content');
                item.category = [...new Set([content('meta[name="ColumnName"]').prop('content'), content('meta[name="ColumnType"]').prop('content'), ...(content('meta[name="Keywords"]').prop('content').split(/,|;/) ?? [])])].filter(
                    (c) => c
                );
                item.pubDate = timezone(parseDate(content('meta[name="PubDate"]').prop('content')), +8);

                return item;
            })
        )
    );

    const image = $('div.logo a img').prop('src');

    ctx.state.data = {
        item: items,
        title: $('title').text(),
        link: currentUrl,
        description: $('meta[name="ColumnDescription"]').prop('content'),
        language: $('html').prop('lang'),
        image,
        subtitle: $('meta[name="ColumnName"]').prop('content'),
        author: $('meta[name="SiteName"]').prop('content'),
    };
};
