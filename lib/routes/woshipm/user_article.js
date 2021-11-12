const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const { id } = ctx.params;
    const limit = ctx.query.limit || 10;
    const link = `http://www.woshipm.com/u/${id}`;

    const data = await got(link).then((res) => res.data);
    const $ = cheerio.load(data);
    const name = $('.author--meta .name').text();

    const list = $('.post--card')
        .slice(0, limit)
        .map((_, item) => {
            item = $(item);
            const postCardTitle = item.find('h2.post--card__title a');
            return {
                title: postCardTitle.attr('title'),
                link: postCardTitle.attr('href'),
                pubDate: parseDate(item.find('time').text(), 'YYYY-MM-DD'),
            };
        })
        .get();

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const data = await got(item.link).then((res) => res.data);
                const content = cheerio.load(data);
                item.description = content('div.grap').html().trim();
                return item;
            })
        )
    );

    ctx.state.data = {
        title: `${name}的文章-人人都是产品经理`,
        link,
        item: items,
    };
};
