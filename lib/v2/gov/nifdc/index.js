const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const { path = 'bshff/ylqxbzhgl/qxggtzh' } = ctx.params;
    const limit = ctx.query.limit ? parseInt(ctx.query.limit, 10) : 30;

    const rootUrl = 'https://www.nifdc.org.cn';
    const currentUrl = new URL(`nifdc/${path}/`, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = cheerio.load(response);

    let items = $('div.list ul li')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            const a = item.find('a');
            const link = a.prop('href');

            return {
                title: a.prop('title') || a.text(),
                link: link.startsWith('http') ? link : new URL(link, currentUrl).href,
                pubDate: parseDate(item.find('span').text().replace(/\(|\)/g, '')),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                try {
                    const { data: detailResponse } = await got(item.link);

                    const content = cheerio.load(detailResponse);

                    item.title = content('.title').text();
                    item.description = content('div.text').append(content('div.fujian')).html();
                    item.author = content('meta[name="ContentSource"]').prop('content');
                    item.category = [
                        ...new Set([content('meta[name="ColumnName"]').prop('content'), content('meta[name="ColumnType"]').prop('content'), ...(content('meta[name="ColumnKeywords"]').prop('content').split(/,|;/) ?? [])]),
                    ].filter((c) => c);
                    item.pubDate = timezone(parseDate(content('meta[name="PubDate"]').prop('content')), +8);
                    item.enclosure_url = content('a.fujianClass').first().prop('href');

                    if (item.enclosure_url) {
                        item.enclosure_url = new URL(item.enclosure_url, rootUrl).href;
                        item.enclosure_type = `application/${item.enclosure_url.split(/\./).pop()}`;
                    }
                } catch (e) {
                    // no-empty
                }

                return item;
            })
        )
    );

    const image = new URL($('div.logo img').prop('src'), currentUrl).href;
    const icon = new URL($('link[rel="shortcut icon"]').prop('href'), currentUrl).href;

    ctx.state.data = {
        item: items,
        title: $('title').text().replace(/----/, ' - '),
        link: currentUrl,
        description: $('meta[name="ColumnDescription"]').prop('content'),
        language: 'zh',
        image,
        icon,
        logo: icon,
        subtitle: $('meta[ name="ColumnName"]').prop('content'),
        author: $('meta[name="SiteName"]').prop('content'),
    };
};
