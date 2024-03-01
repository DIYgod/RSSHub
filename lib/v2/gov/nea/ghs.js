const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const limit = ctx.query.limit ? Number.parseInt(ctx.query.limit, 10) : 35;

    const rootUrl = 'https://www.nea.gov.cn';
    const currentUrl = new URL('sjzz/ghs/', rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = cheerio.load(response);

    let items = $('div.right_box ul li')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            const a = item.find('a');

            return {
                title: a.text(),
                link: a.prop('href'),
                pubDate: parseDate(item.find('span.date-tex').text()),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link);

                const content = cheerio.load(detailResponse);

                item.title = content('meta[name="ArticleTitle"]').prop('content');
                item.description = content('td.detail').html() || content('div.article-content td').html();
                item.author = content('meta[name="ContentSource"]').prop('content');
                item.category = content('meta[name="keywords"]').prop('content').split(/,/);
                item.pubDate = timezone(parseDate(content('meta[name="PubDate"]').prop('content')), +8);

                return item;
            })
        )
    );

    ctx.state.data = {
        item: items,
        title: $('title').text(),
        link: currentUrl,
        description: $('meta[name="ColumnDescription"]').prop('content'),
        language: 'zh',
        subtitle: $('meta[name="ColumnType"]').prop('content'),
        author: $('meta[name="ColumnKeywords"]').prop('content'),
    };
};
