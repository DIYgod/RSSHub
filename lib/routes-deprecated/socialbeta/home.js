const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const currentUrl = `https://socialbeta.com/`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });
    const $ = cheerio.load(response.data);
    const list = $('ul.post li')
        .find('h3.mt10')
        .slice(0, 15)
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
                const res = await got({ method: 'get', url: item.link });
                const content = cheerio.load(res.data);
                const pubDate = content('div.meta').eq(0).text().split('|')[1].replaceAll(/\s+/g, '');
                item.pubDate = new Date(pubDate.slice(0, 10) + ' ' + pubDate.slice(-5, pubDate.length) + ' GMT+8').toUTCString();
                item.description = content('div.content').html();
                return item;
            })
        )
    );

    ctx.state.data = {
        title: 'SocialBeta - 首页',
        link: currentUrl,
        item: items,
    };
};
