const buildData = require('@/utils/common-config');
const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {

    const link = `https://www.lizhi.io/`;

    ctx.state.data = await buildData({
        link,

        url: link,
        title: `数码荔枝`,
        
        item: {
            item: 'a.bg-white',
            title: `$('div.text-16').text()`,
            link: `$('div.text-16').parent().parent().attr('href')`,
            pubDate: `parseDate($('div.text-12').text())`,
        },
    });

    await Promise.all(
        ctx.state.data.item.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: resonse } = await got(item.link);
                const $ = cheerio.load(resonse);
                item.description = $('#content').first().html();
                return item;
            })
        )
    );
};