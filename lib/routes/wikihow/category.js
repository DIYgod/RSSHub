const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const { category, type = 'all' } = ctx.params;
    const link = encodeURI(`https://zh.wikihow.com/Category:${category}`);
    const res = await got(link);
    const $ = cheerio.load(res.data);

    const itemsSelector = type === 'all' ? '#cat_featured .thumbnail' : '#cat_all .thumbnail';
    const item = $(itemsSelector)
        .map((_, ele) => {
            const $item = cheerio.load(ele);
            const title = '如何' + $item('.text span').text();
            const link = $item('a').attr('href');
            const thumbnail = $item('img').attr('data-src');
            return {
                title,
                description: `
                ${title}<br/>
                <img src="${thumbnail}"/>
            `,
                link,
            };
        })
        .get();

    ctx.state.data = {
        title: `wikiHow - ${category}`,
        description: `wikiHow - ${category}`,
        link,
        item,
    };
};
