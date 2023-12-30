const got = require('@/utils/got');
const cheerio = require('cheerio');
const host = 'http://www.jjmhw.cc';
const ua = 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Mobile Safari/537.36';

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const url = host + `/book/${id}`;
    const response = await got.get(url);
    const $ = cheerio.load(response.data);
    const list = $('#detail-list-select > li > a').get().reverse().slice(0, 10);

    const items = await Promise.all(
        list.map(async (item) => {
            item = $(item);
            const itemLink = host + item.attr('href');
            const simple = {
                title: item.text(),
                link: itemLink,
            };
            const details = await ctx.cache.tryGet(itemLink, async () => {
                // 具体页面限制手机UA
                const response = await got.get(itemLink, {
                    headers: {
                        'user-agent': ua,
                    },
                });
                const $ = cheerio.load(response.body);
                const imgs = $('div#cp_img img');
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
