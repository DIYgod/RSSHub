const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const host = 'https://jwb.shu.edu.cn/';
const alias = new Map([
    ['notice', 'tzgg'], // 通知公告
    ['news', 'xw'], // 新闻动态
    ['policy', 'zcwj'], // 政策文件
]);

module.exports = async (ctx) => {
    const type = ctx.params.type || 'notice';
    const link = `https://jwb.shu.edu.cn/index/${alias.get(type) || type}.htm`;
    const respond = await got.get(link);
    const $ = cheerio.load(respond.data);
    const title = $('head title').text();
    const list = $('.only-list')
        .find('li')
        .slice(0, 10)
        .map((index, ele) => ({
            title: $(ele).find('a').text(),
            link: $(ele).find('a').attr('href'),
            date: $(ele).children('span').text(),
        }))
        .get();

    const all = await Promise.all(
        list.map(async (item) => {
            const itemUrl = new URL(item.link, host);
            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }
            const respond = await got.get(itemUrl);
            const $ = cheerio.load(respond.data);
            const single = {
                title: item.title,
                link: itemUrl,
                author: $('[id$=_lblUser]').text().trim(),
                pubDate: parseDate(item.date, 'YYYY年MM月DD日'),
                guid: itemUrl,
                description: $('.v_news_content').html() || item.title,
            };
            ctx.cache.set(itemUrl, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );
    ctx.state.data = {
        title,
        link: host,
        item: all,
    };
};
