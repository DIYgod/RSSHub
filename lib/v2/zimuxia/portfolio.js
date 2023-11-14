const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const rootUrl = 'https://www.zimuxia.cn';
    const currentUrl = `${rootUrl}/portfolio/${id}`;
    const response = await got({
        method: 'get',
        url: currentUrl,
        https: {
            rejectUnauthorized: false,
        },
    });

    const $ = cheerio.load(response.data);

    const items = $('a')
        .filter((_, el) => $(el).attr('href')?.startsWith('magnet:'))
        .toArray()
        .map((item) => {
            item = $(item);
            const title = item
                .parent()
                .contents()
                .filter((_, el) => el.type === 'text')
                .text()
                .trim();

            return {
                link: currentUrl,
                title,
                description: `<p>${item.parent().html()}</p>`,
                enclosure_url: item.attr('href'),
                enclosure_type: 'application/x-bittorrent',
                guid: `${currentUrl}#${title}`,
            };
        })
        .reverse();

    ctx.state.data = {
        title: `${$('.content-page-title').text()} - FIX字幕侠`,
        link: currentUrl,
        item: items,
    };
};
