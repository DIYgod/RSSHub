const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

const map = new Map([
    ['tzgg', { title: '中国科学技术大学研究生院 - 通知公告', id: '9' }],
    ['xwdt', { title: '中国科学技术大学研究生院 - 新闻动态', id: '10' }],
]);

const host = 'https://gradschool.ustc.edu.cn';

module.exports = async (ctx) => {
    const type = ctx.params.type ?? 'tzgg';
    const info = map.get(type);
    if (!info) {
        throw 'invalid type';
    }
    const id = info.id;

    const response = await got(`${host}/column/${id}`);
    const $ = cheerio.load(response.data);
    let items = $('div.r-box > ul')
        .find('li')
        .toArray()
        .map((item) => {
            item = $(item);
            const title = item.find('a').text().trim();
            const link = item.find('a').attr('href').startsWith('/article') ? host + item.find('a').attr('href') : item.find('a').attr('href');
            const pubDate = timezone(parseDate(item.find('time').text(), 'YYYY-MM-DD'), +8);
            return {
                title,
                pubDate,
                link,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                let desc = '';
                try {
                    const response = await got(item.link);
                    desc = cheerio.load(response.data)('article.article').html();
                    item.description = desc;
                } catch (err) {
                    // intranet only contents
                }
                return item;
            })
        )
    );

    ctx.state.data = {
        title: info.title,
        link: `${host}/column/${id}`,
        item: items,
    };
};
