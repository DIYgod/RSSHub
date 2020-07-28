const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const baseUrl = 'http://www.bjp.org.cn';
    const indexUrl = baseUrl + '/col/col89/index.html';

    const res = await got.get(indexUrl);

    const $ = cheerio.load(res.data);

    const list = $('b > a')
        .slice(0, 10)
        .get()
        .map((e) => $(e));

    const items = await Promise.all(
        list.map(async (e) => {
            const link = `${baseUrl}${e.attr('href')}`;

            const cache = await ctx.cache.get(link);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const data = await got.get(link);
            const $ = cheerio.load(data.data);

            const content = $($('body > table')[1]);

            const image = `<img src="${baseUrl}${content.find('img').attr('src')}">`;

            const item = {
                title: $(e).attr('title'),
                pubDate: new Date($('meta[name=pubDate]').attr('content')).toUTCString(),
                description: image + content.find('table').last().html(),
                link,
                guid: link,
            };
            ctx.cache.set(link, JSON.stringify(item));

            return Promise.resolve(item);
        })
    );
    ctx.state.data = {
        title: '北京天文馆每日一图',
        link: indexUrl,
        item: items,
    };
};
