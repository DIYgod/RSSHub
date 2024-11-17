const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const username = ctx.params.username;
    const url = `https://www.pinterest.com/${username}/`;

    // 抓取 Pinterest 用户页面
    const response = await got(url);
    const data = response.body;
    const $ = cheerio.load(data);

    // 解析数据并构建 RSS feed 条目
    const items = [];
    $('.GrowthUnauthPinImage img').each((_, el) => {
        const item = $(el);
        const img_url = item.attr('src');
        const title = item.attr('alt') || 'Pinterest Pin';

        items.push({
            title,
            link: img_url,
            description: `<img src="${img_url}" alt="${title}">`,
        });
    });

    // 设置 RSS feed
    ctx.state.data = {
        title: `${username}'s Pinterest Pins`,
        link: url,
        item: items,
    };
};
