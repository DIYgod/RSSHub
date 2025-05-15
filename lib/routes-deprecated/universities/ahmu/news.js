const got = require('@/utils/got');
const { parseRelativeDate } = require('@/utils/parse-date');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const url = 'http://yjsxy.ahmu.edu.cn/_s62/1840/list.psp';
    const response = await got({ method: 'get', url });
    const $ = cheerio.load(response.data);

    const list = $('#wp_news_w3 table tbody')
        .map((i, e) => {
            const element = $(e);
            const title = element.find('a').text();
            const link = element.find('a').attr('href');
            const dateraw = /(\d{4})\/(\d{2})(\d{2})/.exec(link);

            return {
                title,
                description: '',
                link: url + link,
                author: '安徽医科大学研究生学院',
                pubDate: parseRelativeDate(`${dateraw[1]}-${dateraw[2]}-${dateraw[3]}`),
            };
        })
        .get();

    const result = await Promise.all(
        list.map(async (item) => {
            const link = item.link;

            const cache = await ctx.cache.get(link);
            if (cache) {
                return JSON.parse(cache);
            }

            const itemReponse = await got.get(link);
            const itemElement = cheerio.load(itemReponse.data);

            item.description = itemElement('.content').html();

            ctx.cache.set(link, JSON.stringify(item));
            return item;
        })
    );

    ctx.state.data = {
        title: '安徽医科大学研究生学院',
        link: url,
        item: result,
    };
};
