const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const rootUrl = 'https://yuzu-emu.org';
    const currentUrl = `${rootUrl}/entry`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('.blog-entry-header')
        .map((_, item) => {
            item = $(item);

            return {
                link: item.attr('data-href'),
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
                const content = cheerio.load(detailResponse.data.replace(/<source src="\.\//g, `<source src="${item.link}`));

                const meta = content('.h3').text().trim().split(' on ');

                item.title = content('.title').text();
                item.description = content('.content').html();
                item.author = meta[0].replace('Written by ', '');
                item.pubDate = parseDate(meta[1], 'MMMM DD YYYY');

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
