const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

const baseUrl = 'https://std.stheadline.com';

module.exports = async (ctx) => {
    const { category = '即時' } = ctx.params;
    const url = `${baseUrl}/realtime/${category}`;
    const { data: response } = await got(url);
    const $ = cheerio.load(response);

    const items = $('.col-md-9 .media-body .h5 a')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.attr('title'),
                link: item.attr('href'),
                guid: item.attr('href').substring(0, item.attr('href').lastIndexOf('/')),
            };
        });

    await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = cheerio.load(response);

                item.description = $('.paragraphs').html();
                item.pubDate = timezone(parseDate($('.content .date').text()), +8);

                return item;
            })
        )
    );

    ctx.state.data = {
        title: $('head title').text(),
        description: $('meta[name=description]').attr('content'),
        image: 'https://std.stheadline.com/dist/images/favicon/icon-512.png',
        link: url,
        item: items,
    };
};
