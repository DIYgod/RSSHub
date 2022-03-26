const url = require('url');
const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const currentUrl = `https://forum.mobilism.org/viewforum.php?f=19`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });
    const $ = cheerio.load(response.data);
    const list = $('tbody')
        .eq(1)
        .find('tr')
        .map((_, item) => {
            item = $(item);
            const a = item.find('a');
            return {
                title: a.text(),
                link: url.resolve(`https://forum.mobilism.org`, a.attr('href')),
            };
        })
        .get();

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const res = await got({ method: 'get', url: item.link });
                const content = cheerio.load(res.data);

                item.description = content('div.content').html();
                return item;
            })
        )
    );

    ctx.state.data = {
        title: 'Mobilism - eBook Releases',
        link: currentUrl,
        item: items,
    };
};
