const got = require('@/utils/got');
const cheerio = require('cheerio');
const host = 'http://www.pknbc.com';

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const url = host + `/book/${id}`;
    const response = await got.get(url);
    const $ = cheerio.load(response.data);
    const list = $('#detail-list-select > li > a').reverse().slice(0, 10).get();

    const items = await Promise.all(
        list.map(async (item) => {
            item = $(item);
            const itemLink = host + item.attr('href');
            const simple = {
                title: item.text(),
                link: itemLink,
            };
            const details = await ctx.cache.tryGet(itemLink, async () => {
                const response = await got.get(itemLink);
                const $ = cheerio.load(response.body);
                const imgs = $('div.comicpage img');
                let pics = '';
                imgs.each((_, ele) => {
                    const $ele = $(ele);
                    const src = $ele.attr('data-original');
                    pics += `<img src="${src}" referrerpolicy="no-referrer">`;
                });
                return {
                    description: `<div>${pics}</div>`,
                };
            });
            return Promise.resolve(Object.assign({}, simple, details));
        })
    );
    ctx.state.data = {
        title: '漫小肆 ' + $('div.info > h1').text(),
        link: url,
        description: '漫小肆 ' + $('div.info > h1').text(),
        item: items,
    };
};
