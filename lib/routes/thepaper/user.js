const cheerio = require('cheerio');
const got = require('@/utils/got');
const date = require('@/utils/date');

module.exports = async (ctx) => {
    const { id } = ctx.params;
    const rootUrl = 'https://www.thepaper.cn';

    const link = `${rootUrl}/user_${id}`;
    const res = await got.get(link);

    const $ = cheerio.load(res.data);
    const list = $('#masonryContent').find('.news_li').toArray();

    const items = await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);
            const itemUrl = `https://www.thepaper.cn/${$(item).find('a').eq(0).attr('href')}`;
            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const res = await got.get(itemUrl);
            const content = cheerio.load(res.data);

            const description = content('.news_txt').html();
            const dateStr = content('.news_about').find('p').text().trim().split('来源：')[0].trim();
            const pubDate = date(dateStr, +8);

            const single = {
                title: content('.news_title').text(),
                link: itemUrl,
                description,
                pubDate,
                author: content('.name', '.news_paike_author').text(),
            };
            return Promise.resolve(single);
        })
    );

    const name = items[0].author || id;

    ctx.state.data = {
        title: `澎湃号 - ${name}`,
        link: `${rootUrl}/user_${id}`,
        item: items,
    };
};
