const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const colPath = ctx.path.replace(/^\//, '') || '32942';
    const limit = ctx.query.limit ? parseInt(ctx.query.limit) : 50;

    const rootUrl = 'https://www.bast.net.cn';
    const currentUrl = `${rootUrl}/${isNaN(colPath) ? colPath : `col/col${colPath}`}/`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    let $ = cheerio.load(response.data);

    $('.list-title-bif').remove();

    const title = $('title').text();
    let selection = $('a[title]');

    if (selection.length === 0) {
        $ = cheerio.load($('ul.cont-list div script').first().text());

        $('.list-title-bif').remove();

        selection = $('a[title]');
    }

    let items = selection
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.text().trim(),
                link: item.attr('href'),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                if (/bast\.net\.cn/.test(item.link)) {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.link,
                    });

                    const content = cheerio.load(detailResponse.data);

                    item.title = content('meta[name="ArticleTitle"]').attr('content');
                    item.author = content('meta[name="contentSource"]').attr('content');
                    item.pubDate = timezone(parseDate(content('meta[name="pubdate"]').attr('content')), +8);
                    item.category = [content('meta[name="ColumnName"]').attr('content')];

                    item.description = content('.arccont').html();
                }

                return item;
            })
        )
    );

    ctx.state.data = {
        title,
        link: currentUrl,
        item: items,
    };
};
