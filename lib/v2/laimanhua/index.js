const got = require('@/utils/got');
const iconv = require('iconv-lite');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const { id } = ctx.params;
    const baseUrl = `https://www.laimanhua8.com`;
    const link = `${baseUrl}/kanmanhua/${id}/`;

    const { data: response } = await got(link, {
        responseType: 'buffer',
    });
    let $ = cheerio.load(iconv.decode(response, 'utf-8'));
    const charset = $('meta[http-equiv="Content-Type"]')
        .attr('content')
        ?.match(/charset=(.*)/)?.[1];
    if (charset?.toLowerCase() !== 'utf-8') {
        $ = cheerio.load(iconv.decode(response, charset ?? 'utf-8'));
    }

    const items = $('.plist a')
        .toArray()
        .map((item, index) => {
            item = $(item);
            return {
                title: item.attr('title'),
                link: `${baseUrl}${item.attr('href')}`,
                pubDate: index === 0 ? parseDate($('head meta[property="og:novel:update_time"]').attr('content')) : null,
                author: $('head meta[property="og:novel:author"]').attr('content'),
            };
        });

    ctx.state.data = {
        title: `${$('head meta[property="og:novel:book_name"]').attr('content')} - 来漫画`,
        description: $('.introduction').text(),
        image: $('head meta[property="og:image"]').attr('content'),
        link,
        item: items,
    };
};
