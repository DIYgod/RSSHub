const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const currentUrl = 'http://www.bioon.com';
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);
    const list = $('#cms_list li[data-i]')
        .slice(0, 10)
        .map((_, item) => {
            item = $(item);
            const a = item.find('a');

            return {
                title: a.text(),
                link: a.attr('href'),
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

                const subtitle = content('div.title5 p').text().split(' ');
                const pubDate = `${subtitle.slice(-2)[0]} ${subtitle.slice(-1)}`;

                item.pubDate = new Date(pubDate + ' GMT+8').toUTCString();
                item.description = content('div.text3').html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: '生物谷 - 最新资讯',
        link: currentUrl,
        item: items,
    };
};
