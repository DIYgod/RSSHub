const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

const map = new Map([
    ['tzgg', { title: '中国科学技术大学信息科学技术学院 - 通知公告', id: '5142' }],
    ['zsgz', { title: '中国科学技术大学信息科学技术学院 - 招生工作', id: '5108' }],
]);

const host = 'https://sist.ustc.edu.cn';

module.exports = async (ctx) => {
    const type = ctx.params.type ?? 'tzgg';
    const info = map.get(type);
    if (!info) {
        throw 'invalid type';
    }
    const id = info.id;

    const response = await got(`${host}/${id}/list.htm`);
    const $ = cheerio.load(response.data);
    let items = $('div#wp_news_w12')
        .find('li')
        .toArray()
        .map((item) => {
            item = $(item);
            const title = item.find('a').attr('title').trim();
            const link = item.find('a').attr('href').startsWith('/') ? host + item.find('a').attr('href') : item.find('a').attr('href');
            const pubDate = timezone(parseDate(item.find('span').text(), 'YYYY-MM-DD'), +8);
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
                    desc = cheerio.load(response.data)('div.wp_articlecontent').html();
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
        link: `${host}/${id}/list.htm`,
        item: items,
    };
};
