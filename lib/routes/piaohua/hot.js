const url = require('url');
const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const link = 'https://www.piaohua.com/';
    const response = await got({
        method: 'get',
        url: link,
    });
    const $ = cheerio.load(response.data);
    const list = $('ul.ul-imgtxt1.row li')
        .map((_, item) => {
            item = $(item);
            return {
                title: item.find('h3').text(),
                link: url.resolve(link, item.find('a').attr('href')),
                pubDate: new Date(item.find('span').text()).toUTCString(),
            };
        })
        .get();

    ctx.state.data = {
        title: '飘花电影网 - 今日推荐',
        link: link,
        item: await Promise.all(
            list.map(
                async (item) =>
                    await ctx.cache.tryGet(item.link, async () => {
                        const detailResponse = await got({ method: 'get', url: item.link });
                        const content = cheerio.load(detailResponse.data);
                        item.description = content('div.m-text1').html();
                        return item;
                    })
            )
        ),
    };
};
