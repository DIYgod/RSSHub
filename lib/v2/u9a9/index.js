const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

const baseUrl = 'https://u9a9.com';

module.exports = async (ctx) => {
    const { preview, keyword } = ctx.params;

    let link;
    let title;
    if (keyword) {
        link = `${baseUrl}/?type=2&search=${keyword}`;
        title = `${keyword} - U9A9`;
    } else {
        link = baseUrl;
        title = 'U9A9';
    }

    const { data: response } = await got(link);
    const $ = cheerio.load(response);

    const items = $('table tr')
        .slice(1) // skip thead
        .toArray()
        .map((item) => {
            item = $(item);
            const a = item.find('td').eq(1).find('a');
            const { size, unit } = item
                .find('td')
                .eq(3)
                .text()
                .match(/(?<size>\d+\.\d+)\s(?<unit>\w+)/).groups;
            return {
                title: a.attr('title'),
                link: `${baseUrl}${a.attr('href')}`,
                pubDate: timezone(parseDate(item.find('td').eq(4).text()), +8),

                enclosure_url: item.find('td').eq(2).find('a').eq(1).attr('href'),
                enclosure_length: parseInt(size * (unit === 'GB' ? 1024 * 1024 * 1024 : 1024 * 1024)),
                enclosure_type: 'application/x-bittorrent',
            };
        });

    if (preview) {
        await Promise.all(
            items.map((item) =>
                ctx.cache.tryGet(item.link, async () => {
                    const { data: response } = await got(item.link);
                    const $ = cheerio.load(response);

                    item.description = $('.panel-body').eq(1).html();

                    return item;
                })
            )
        );
    }

    ctx.state.data = {
        title,
        link,
        item: items,
    };
};
