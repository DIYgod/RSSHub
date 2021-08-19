const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');

const baseTitle = 'NUIST CS（南信大计软院）';
const baseUrl = 'http://scs.nuist.edu.cn';
const map = {
    2242: '学院新闻',
    2237: '学生工作',
    2245: '通知公告',
    2246: '教务通知',
    2243: '科研动态',
    2244: '招生就业',
};

module.exports = async (ctx) => {
    const category = map.hasOwnProperty(ctx.params.category) ? ctx.params.category : 2242;
    const link = baseUrl + '/' + category + '/list.htm';

    const response = await got.get(link);
    const $ = cheerio.load(response.data);

    const list = $('#wp_news_w6')
        .find('.list_item')
        .slice(0, 8)
        .map((index, item) => {
            item = $(item);
            return {
                title: item.find('.Article_Title').text(),
                link: url.resolve(baseUrl, item.find('.Article_Title a').attr('href')),
                pubDate: new Date(item.find('.Article_PublishDate').text()).toUTCString(),
            };
        })
        .get();

    const items = await Promise.all(
        [...list].map(async (item) => {
            const cache = await ctx.cache.get(item.link);
            if (cache) {
                return JSON.parse(cache);
            }

            const response = await got.get(item.link);
            const $ = cheerio.load(response.data);

            item.author = $('.arti_publisher').text().replace('发布者：', '');
            item.description = $('.wp_articlecontent').html();
            item.category = map[category];

            ctx.cache.set(item.link, JSON.stringify(item));
            return item;
        })
    );

    ctx.state.data = {
        title: baseTitle + ':' + map[category],
        link,
        item: items.filter((x) => x),
    };
};
