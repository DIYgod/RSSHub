const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const currentUrl = `https://sns.91ddcc.com/s/${ctx.params.stage}`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);
    const list = $('div.log-box div.l-single')
        .slice(0, 5)
        .map((_, item) => {
            item = $(item);
            const a = item.find('div.word a.s-til');
            return {
                title: a.text(),
                link: `https://sns.91ddcc.com${a.attr('href')}`,
                pubDate: new Date(item.find('div.floor a.fr').text() + ' GMT+8').toUTCString(),
                author: item.find('div.floor a.fl').text(),
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

                item.description = content('div.article-con').html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `${$('a.name').text()} - 才符`,
        link: currentUrl,
        item: items,
        description: $('div.bot-info').text(),
    };
};
