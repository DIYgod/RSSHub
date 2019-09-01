const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const { id = '' } = ctx.params;
    const link = `https://weekly.75team.com/issue${id}.html`;

    const cache = await ctx.cache.get(link);
    if (cache) {
        ctx.state.data = JSON.parse(cache);
        return;
    }

    const response = await got.get(link);

    const $ = cheerio.load(response.data);
    const items = [];

    $('.container li.article').each((i, e) => {
        const linkEle = $('.title a', e);
        items.push({
            title: linkEle.text().trim(),
            link: linkEle.attr('href'),
            description: $('.desc', e)
                .text()
                .trim(),
        });
    });

    const data = {
        title: `奇舞周刊第${id}期`,
        link,
        item: items,
    };
    ctx.cache.set(link, JSON.stringify(data));
    ctx.state.data = data;
};
