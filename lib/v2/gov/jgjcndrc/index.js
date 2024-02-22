const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const { id = 'sytzgg' } = ctx.params;
    const limit = ctx.query.limit ? Number.parseInt(ctx.query.limit, 10) : 30;

    const rootUrl = 'http://www.jgjcndrc.org.cn';
    const currentUrl = new URL(`list.aspx?clmId=${id}`, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = cheerio.load(response);

    let items = $('ul.list_02 li.li a[title]')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.text(),
                link: new URL(item.prop('href'), rootUrl).href,
                pubDate: parseDate(item.prev().text()),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link);

                const content = cheerio.load(detailResponse);

                item.title = content('div.txt_title1').text();
                item.description = content('div#zoom').html();
                item.pubDate = parseDate(content('div.txt_subtitle1').text().trim());

                return item;
            })
        )
    );

    const author = $('title').text();
    const subtitle = $('li.L').first().text();
    const image = new URL($('img.logo2').prop('src'), rootUrl).href;

    ctx.state.data = {
        item: items,
        title: `${author} - ${subtitle}`,
        link: currentUrl,
        description: author,
        language: $('html').prop('lang'),
        image,
        subtitle,
        author,
    };
};
