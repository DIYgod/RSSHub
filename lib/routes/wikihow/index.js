const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const link = `https://zh.wikihow.com/${encodeURIComponent('首页')}`;
    const res = await got(link);
    const $ = cheerio.load(res.data);

    const item = $('#fa_container td.image_map')
        .map((_, ele) => {
            const $item = cheerio.load(ele);
            const title = '如何' + $item('.text span').text();
            const link = $item('.thumbnail > a').attr('href');
            const thumbnail = $item('.thumbnail img').attr('data-src');
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
        title: 'wikiHow - 首页',
        description: 'wikiHow - 首页',
        link,
        item,
    };
};
