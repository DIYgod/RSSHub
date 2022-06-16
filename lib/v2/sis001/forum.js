const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');
const baseUrl = 'https://www.sis001.com';

module.exports = async (ctx) => {
    const { id = 76 } = ctx.params;
    const url = `${baseUrl}/forum/forum-${id}-1.html`;

    const response = await got(url);

    const $ = cheerio.load(response.data);

    let items = $('form table')
        .last()
        .find('tbody')
        .toArray()
        .slice(1) // skip first empty row
        .map((item) => {
            item = $(item);
            return {
                title: item.find('th em').text() + ' ' + item.find('span a').eq(0).text(),
                link: new URL(item.find('span a').eq(0).attr('href'), `${baseUrl}/forum/`).href,
                author: item.find('.author a').text(),
                pubDate: parseDate(item.find('.author em').text(), 'YYYY-M-D'),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const response = await got(item.link);
                const $ = cheerio.load(response.data);

                item.category = $('.posttags a')
                    .toArray()
                    .map((a) => $(a).text());
                item.pubDate = timezone(
                    parseDate(
                        $('.postinfo')
                            .eq(0)
                            .text()
                            .match(/发表于 (.*)\s*只看该作者/)[1],
                        'YYYY-M-D HH:mm'
                    ),
                    8
                );
                $('div[id^=postmessage_] table, fieldset, .posttags').remove();
                item.description = $('div[id^=postmessage_]').eq(0).html() + ($('.defaultpost .postattachlist').html() ?? '');
                return item;
            })
        )
    );

    ctx.state.data = {
        title: $('head title').text(),
        description: $('meta[name=description]').attr('content'),
        link: url,
        item: items,
    };
};
