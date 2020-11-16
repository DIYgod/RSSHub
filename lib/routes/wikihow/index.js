const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const link = `https://zh.wikihow.com/${encodeURIComponent('首页')}`;
    const res = await got(link);
    const $ = cheerio.load(res.data);

    const item = $('#hp_featured_container .hp_thumb  a')
        .map((_, ele) => {
            const $item = cheerio.load(ele);
            const title = '如何' + $item('div p').text();
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
        title: 'wikiHow - 首页',
        description: 'wikiHow - 首页',
        link,
        item,
    };
};
