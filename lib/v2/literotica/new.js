const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const rootUrl = 'https://www.literotica.com';
    const currentUrl = `${rootUrl}/stories/new_submissions.php`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('.b-46t')
        .map((_, item) => {
            item = $(item);

            const a = item.find('.p-48y');

            return {
                title: a.text(),
                link: a.attr('href'),
                category: item.nextAll().eq(3).text().replace(/\(|\)/g, '').trim(),
                pubDate: parseDate(item.nextAll().eq(4).text().trim(), 'MM/DD/YY'),
                author: item
                    .nextAll()
                    .eq(2)
                    .text()
                    .replace(/Submitted by/, '')
                    .trim(),
            };
        })
        .get();

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = cheerio.load(detailResponse.data);

                item.description = content('.aa_ht').html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
};
