const got = require('@/utils/got');
const cherrio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const pageUrl = 'https://support.bluestacks.com/hc/en-us/articles/360056960211-Release-Notes-BlueStacks-5';

module.exports = async (ctx) => {
    const res = await got(pageUrl, {
        headers: {
            referer: 'https://support.bluestacks.com/hc/en-us',
        },
    });
    const $ = cherrio.load(res.data);

    const list = $('div h3 a')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.text(),
                link: item.attr('href'),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const res = await got(item.link);
                const $ = cherrio.load(res.data);

                item.description = $('div.article__body').html();
                item.pubDate = parseDate($('div.meta time').attr('datetime'));

                return item;
            })
        )
    );

    ctx.state.data = {
        title: $('.article__title').text().trim(),
        description: $('meta[name=description]').text().trim(),
        link: pageUrl,
        image: $('link[rel="shortcut icon"]').attr('href'),
        item: items,
    };
};
