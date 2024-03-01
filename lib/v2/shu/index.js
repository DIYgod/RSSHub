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
    const title = $('title').text();
    const list = $('.ej_main .list')
        .find('li')
        .slice(0, 5)
        .toArray()
        .map((ele) => ({
            title: $(ele).find('.bt').text(),
            link: new URL($(ele).find('a').attr('href'), host).href,
            date: $(ele).find('.sj').text(),
        }));

    const all = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const response = await got.get(item.link);
                const $ = cheerio.load(response.data);
                item.author = $('.xx>:nth-child(2)').text().trim().slice(3); // 投稿：xxx
                item.pubDate = parseDate(item.date, 'YYYY.MM.DD');
                item.description = $('.v_news_content').html() || item.title;
                return item;
            })
        )
    );

    ctx.state.data = {
        title,
        link,
        item: all,
    };
};
