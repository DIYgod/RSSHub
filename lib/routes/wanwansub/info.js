const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const rootUrl = 'http://wanwansub.com';
    const currentUrl = `${rootUrl}/info/${id}`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const items = $('.lightbox-image')
        .nextAll('p')
        .slice(3)
        .map((_, item) => {
            const i = {};

            item = $(item);

            item.find('a').each(function () {
                if ($(this).text() === '磁力') {
                    i.enclosure_url = $(this).attr('href');
                    i.enclosure_type = 'application/x-bittorrent';
                }
            });

            i.description = `<p>${item.html()}</p>`;
            i.title = item.text().split(' ')[0];
            i.link = currentUrl;

            return i;
        })
        .get();

    ctx.state.data = {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
};
