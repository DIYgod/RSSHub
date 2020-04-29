const got = require('@/utils/got');
const cheerio = require('cheerio');

const buildItems = data => {
    const $ = cheerio.load(data);
    const list = $('div[class="topicContent front_content"]');

    const items = [];
    list.children().each((i, el) => {
        el = $(el);
        if (el.is('h2') || el.is('h3')) {
            title = el.text();
            items.push({ 'title': title, });
        }
    });

    list.find('img').each((i, el) => {
        link = $(el).attr('src');
        items[i]['link'] = link;
        items[i]['description'] = `<img src=${link}>`;
    });

    return items;
};


module.exports = async (ctx) => {

    link = 'http://www.vgtime.com/topic/1041104.jhtml';

    items = await ctx.cache.tryGet(link, async () => {
        response = await got({
            method: 'GET',
            url: link,
        });
        return buildItems(response.data);
    })

    ctx.state.data = {
        title: '《星期一的丰满》 - 比村奇石 - 游戏时光',
        link: link,
        item: items
    };
};