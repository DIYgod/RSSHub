const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const baseUrl = 'https://is.cas.cn';

module.exports = async (ctx) => {
    const { path } = ctx.params;
    const response = await got(`${baseUrl}/${path}/`);

    const $ = cheerio.load(response.data);
    const items = $('.list-news ul li')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('a').text(),
                link: new URL(item.find('a').attr('href'), response.url).href,
                pubDate: parseDate(item.find('span').text().replace(/\[|\]/g, '')),
            };
        });

    await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                if (!item.link.startsWith(`${baseUrl}/`)) {
                    return item;
                }

                const response = await got(item.link);
                const $ = cheerio.load(response.data);

                item.description = $('.TRS_Editor').html();
                return item;
            })
        )
    );

    ctx.state.data = {
        title: $('head title').text(),
        link: `${baseUrl}/${path}`,
        item: items,
    };
};
