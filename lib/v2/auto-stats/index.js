const got = require('@/utils/got');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const { category = 'xxkd' } = ctx.params;
    const limit = ctx.query.limit ? Number.parseInt(ctx.query.limit, 10) : 30;

    const rootUrl = 'http://www.auto-stats.org.cn';
    const currentUrl = new URL(`${category}.asp`, rootUrl).href;

    const { data: response } = await got(currentUrl, {
        responseType: 'buffer',
    });

    const $ = cheerio.load(iconv.decode(response, 'gbk'));

    let items = $('a.dnews font')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            const title = item.text();
            const pubDate = title.match(/(\d{4}(?:\/\d{1,2}){2}\s\d{1,2}(?::\d{2}){2})/)?.[1] ?? undefined;

            return {
                title: title.replace(/●/, '').split(/（\d+/)[0],
                link: new URL(item.parent().prop('href'), rootUrl).href,
                pubDate: timezone(parseDate(pubDate, 'YYYY/M/D H:mm:ss'), +8),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link, {
                    responseType: 'buffer',
                });

                const content = cheerio.load(iconv.decode(detailResponse, 'gbk'));

                item.description = content('table tbody tr td.dd').last().html();

                return item;
            })
        )
    );

    const subtitle = $('title').text().split(/——/).pop();
    const image = new URL('images/logo.jpg', rootUrl).href;

    ctx.state.data = {
        item: items,
        title: $('title').text(),
        link: currentUrl,
        description: subtitle,
        language: 'zh',
        image,
        subtitle,
        allowEmpty: true,
    };
};
