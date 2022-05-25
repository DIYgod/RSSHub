const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

const map = new Map([
    ['tzgg', { title: '中国科学技术大学电子工程与信息科学系 - 通知公告', id: '2702' }],
    ['xwxx', { title: '中国科学技术大学电子工程与信息科学系 - 新闻信息', id: '2706' }],
]);

const host = 'https://eeis.ustc.edu.cn';

module.exports = async (ctx) => {
    const type = ctx.params.type ?? 'tzgg';
    const info = map.get(type);
    if (!info) {
        throw 'invalid type';
    }
    const id = info.id;

    const response = await got(`${host}/${id}/list.htm`);
    const $ = cheerio.load(response.data);
    const list = $('div[portletmode=simpleList]')
        .find('div.newslist')
        .toArray()
        .map((item) => {
            item = $(item);
            const title = item.find('a').attr('title').trim();
            const link = item.find('a').attr('href').startsWith('/') ? host + item.find('a').attr('href') : item.find('a').attr('href');
            const pubDate = timezone(parseDate(item.find('.text-secondary').text() + '/' + item.find('.text-primary').text(), 'YYYY/MM/DD'), +8);
            return {
                title,
                pubDate,
                link,
            };
        });

    const items = await Promise.all(
        list.map((item) =>
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
