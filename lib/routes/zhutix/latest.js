const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const currentUrl = 'https://zhutix.com/';
    const response = await got({
        method: 'get',
        url: currentUrl,
    });
    const $ = cheerio.load(response.data);
    const list = $('#main div.grid-bor div.content-card')
        .slice(0, 10)
        .map((_, item) => {
            item = $(item);
            const a = item.find('a');
            return {
                title: a.text(),
                link: a.attr('href'),
                pubDate: new Date(item.find('i.feng-liulanjilu').parent().text()).toUTCString(),
            };
        })
        .get();

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const res = await got({ method: 'get', url: item.link });
                const content = cheerio.load(res.data);

                item.description = content('#entry-content').html();
                return item;
            })
        )
    );

    ctx.state.data = {
        title: '致美化 - 最新主题',
        link: currentUrl,
        item: items,
    };
};
