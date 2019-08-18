const date = require('@/utils/date');
const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const url = 'https://www.yinwang.org';
    const response = await got({ method: 'get', url });
    const $ = cheerio.load(response.data);

    const list = $("li[class='list-group-item title']")
        .map((i, e) => {
            const element = $(e);
            const title = element.find('a').text();
            const link = url + element.find('a').attr('href');
            const dateraw = /(\d+)\/(\d+)\/(\d+)/.exec(link);

            return {
                title: title,
                description: '',
                link: link,
                author: '王垠',
                pubDate: date(`${dateraw[1]}-${dateraw[2]}-${dateraw[3]}`),
            };
        })
        .get();

    const result = await Promise.all(
        list.map(async (item) => {
            const link = item.link;

            const cache = await ctx.cache.get(link);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const itemReponse = await got.get(link);
            const itemElement = cheerio.load(itemReponse.data);
            item.description = itemElement('.inner').html();

            ctx.cache.set(link, JSON.stringify(item));
            return Promise.resolve(item);
        })
    );

    ctx.state.data = {
        title: '王垠的博客 - 当然我在扯淡',
        link: url,
        item: result,
    };
};
