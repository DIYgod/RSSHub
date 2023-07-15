const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const params = ctx.path === '/nifdc' ? '/nifdc/bshff/ylqxbzhgl/qxggtzh' : ctx.path;

    const rootUrl = 'https://www.nifdc.org.cn';
    const currentUrl = `${rootUrl}${params}/index.html`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    let items = $('.list ul li a')
        .slice(0, ctx.query.limit ? parseInt(ctx.query.limit) : 20)
        .toArray()
        .map((item) => {
            item = $(item);

            const link = item.attr('href');

            return {
                title: item.text(),
                link: /^http/.test(link) ? link : new URL(link, currentUrl).href,
                pubDate: parseDate(
                    item
                        .next()
                        .text()
                        .match(/\((.*)\)/)
                ),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                if (/^https:\/\/www\.nmpa\.gov\.cn\//.test(item.link)) {
                    const { data: html } = await got(item.link);

                    const content = cheerio.load(html);

                    item.description = content('.text').html();
                    item.pubDate = timezone(parseDate($('meta[name="PubDate"]').attr('content')), +8);
                } else {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.link,
                    });

                    const content = cheerio.load(detailResponse.data);

                    item.description = content('.text').append(content('.fujian')).html();
                    item.pubDate = timezone(parseDate(content('meta[name="PubDate"]').attr('content')), +8);
                }

                return item;
            })
        )
    );

    ctx.state.data = {
        title: $('title').text().replace(/----/, ' - '),
        link: currentUrl,
        item: items,
    };
};
