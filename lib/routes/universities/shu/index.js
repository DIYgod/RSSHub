const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const host = 'https://www.shu.edu.cn/';
const alias = new Map([
    ['news', 'zhxw'], // 综合新闻
    ['research', 'kydt1'], // 科研动态
    ['kydt', 'kydt1'], // 科研动态
    ['notice', 'tzgg'], // 通知公告
    ['important', 'zyxw'], // 重要新闻
]);

module.exports = async (ctx) => {
    const type = ctx.params.type || 'news';
    const link = `https://www.shu.edu.cn/${alias.get(type) || type}.htm`;
    const respond = await got.get(link);
    const $ = cheerio.load(respond.data);
    const title = $('head title').text();
    const list = $('.ej_main .list')
        .find('li')
        .slice(0, 5)
        .map((index, ele) => ({
            title: $(ele).find('.bt').text(),
            link: $(ele).find('a').attr('href'),
            date: $(ele).find('.sj').text(),
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
                author: $('.xx>:nth-child(2)').text().trim().slice(3), // 投稿：xxx
                pubDate: parseDate(item.date, 'YYYY.MM.DD'),
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
