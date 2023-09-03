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

    const items = (
        await (async () => {
            const headers = {
                'Accept-Language': 'en-US,en;q=0.5',
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            };
            if (category === '即時') {
                const res = await got
                    .post('https://std.stheadline.com/realtime/get_more_instant_news', {
                        headers,
                        form: {
                            page: 1,
                        },
                    })
                    .json();
                return res;
            } else {
                const res = await got
                    .post('https://std.stheadline.com/realtime/get_more_news', {
                        headers,
                        form: {
                            page: 1,
                            cat: category,
                        },
                    })
                    .json();
                return res;
            }
        })()
    ).data.map((e) => ({
        title: e.title,
        link: e.articleLink,
        guid: e.articleLink.substring(0, e.articleLink.lastIndexOf('/')),
    }));

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
