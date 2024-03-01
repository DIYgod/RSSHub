const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const url = 'http://mysql.taobao.org/monthly/';
    const response = await got({ method: 'get', url });
    const $ = cheerio.load(response.data);

    const list = $("ul[class='posts'] > li")
        .map((i, e) => {
            const element = $(e);
            const title = element.find('a').text().trim();
            const link = `http://mysql.taobao.org${element.find('a').attr('href').trim()}/`;
            return {
                title,
                description: '',
                link,
            };
        })
        .get();

    const result = await Promise.all(
        list.map((item) => {
            const link = item.link;

            return ctx.cache.tryGet(link, async () => {
                const itemReponse = await got(link);
                const itemElement = cheerio.load(itemReponse.data);
                item.description = itemElement('.content').html();
                return item;
            });
        })
    );

    ctx.state.data = {
        title: $('title').text(),
        link: url,
        item: result.reverse(),
    };
};
