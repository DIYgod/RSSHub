const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const link = 'https://www.appinn.com/';
    const res = await got(link);
    const $ = cheerio.load(res.data);

    const item = $('#latest-posts article')
        .map((_, ele) => {
            const $item = cheerio.load(ele);
            const baseInfoNode = $item('.post-title > a');
            const link = baseInfoNode.attr('href');
            const title = baseInfoNode.text();
            const pubDate = new Date($item('.thetime > span').text()).toUTCString();
            const desc = $item('.post-excerpt').text();
            const thumbnail = $item('.post-img img').attr('data-lazy-src');
            return {
                title,
                link,
                description: `
            ${desc}<br/>
            <img src="${thumbnail}"/>
        `,
                pubDate,
            };
        })
        .get();

    ctx.state.data = {
        title: `小众软件 - 首页`,
        description: `小众软件 - 首页`,
        link,
        item,
    };
};
