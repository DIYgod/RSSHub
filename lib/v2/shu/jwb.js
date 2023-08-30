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
    const title = $('title').text();
    const list = $('.only-list')
        .find('li')
        .slice(0, 10)
        .toArray()
        .map((ele) => ({
            title: $(ele).find('a').text(),
            link: new URL($(ele).find('a').attr('href'), host).href,
            date: $(ele).children('span').text(),
        }));

    const all = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const response = await got.get(item.link);
                const $ = cheerio.load(response.data);
                item.author = $('[id$=_lblUser]').text().trim();
                item.pubDate = parseDate(item.date, 'YYYY年MM月DD日');
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
