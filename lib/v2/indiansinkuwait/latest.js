const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const baseUrl = 'https://www.indiansinkuwait.com';

module.exports = async (ctx) => {
    const { data: response } = await got(`${baseUrl}/latest-news`);
    const $ = cheerio.load(response);

    const list = $('.paragraphs .span4')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('.content-heading h6 a').text().trim(),
                link: baseUrl + item.find('a').attr('href'),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = cheerio.load(response);

                item.pubDate = parseDate($('#ctl00_ContentPlaceHolder1_SpanAuthor').text());
                $('#newsdetails h3, #ctl00_ContentPlaceHolder1_SpanAuthor, .noprint, [id^=div-gpt-ad]').remove();
                item.description = $('#newsdetails').html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: $('head title').text(),
        description: $('head meta[name="description"]').attr('content'),
        image: 'https://www.indiansinkuwait.com/apple-touch-icon-152x152-precomposed.png',
        link: `${baseUrl}/latest-news`,
        item: items,
    };
};
