const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const baseUrl = 'https://www.ahhhhfs.com/';

module.exports = async (ctx) => {
    const { data: response } = await got({
        url: baseUrl,
        headers: {
            Referer: baseUrl,
        },
    });

    const $ = cheerio.load(response);
    const list = $('.col-lg-6')
        .toArray()
        .map((item) => {
            item = $(item);
            const a = item.find('.entry-wrapper').first();
            console.log(item.find('.time').attr('datetime'));
            console.log(a.find('.meta-category-dot').text());
            return {
                title: a.find('h2 a').attr('title'),
                link: a.find('h2 a').attr('href'),
                pubDate: parseDate(item.find('time').attr('datetime')),
                category: a.find('.meta-category-dot').text(),
            };
        });

    // item content
    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = cheerio.load(response);
                item.description = $('.entry-content').first().html();
                return item;
            })
        )
    );

    ctx.state.data = {
        title: 'A姐分享',
        link: baseUrl,
        item: items,
    };
};
