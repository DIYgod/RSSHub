const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const { id = '342' } = ctx.params;
    const limit = ctx.query.limit ? Number.parseInt(ctx.query.limit, 10) : 30;

    const rootUrl = 'https://pe2016.sspu.edu.cn';
    const currentUrl = new URL(`${id}/list.htm`, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = cheerio.load(response);

    let items = $('table.wp_article_list_table a[title]')
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
                if (item.link.endsWith('htm')) {
                    const { data: detailResponse } = await got(item.link);

                    const content = cheerio.load(detailResponse);

                    const info = content('div.time').text();

                    item.title = content('div.title').text();
                    item.description = content('div.wp_articlecontent').html();
                    item.author = info.match(/来源：(.*?)\s/)?.[1] ?? undefined;
                    item.pubDate = info.match(/发布时间：(\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2})\s/)?.[1] ?? undefined;
                }

                return item;
            })
        )
    );

    const author = '上海第二工业大学';
    const subtitle = $('title').text();
    const icon = new URL($('link[rel="shortcut icon"]').prop('href'), rootUrl).href;

    ctx.state.data = {
        item: items,
        title: `${author} - ${subtitle}`,
        link: currentUrl,
        description: $('div.tyb_headtitle1').text(),
        language: $('html').prop('lang'),
        icon,
        logo: icon,
        subtitle,
        author,
    };
};
