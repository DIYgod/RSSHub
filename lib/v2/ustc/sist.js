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
    let items = $('div[portletmode=simpleList]')
        .find('div.card')
        .toArray()
        .map((item) => {
            item = $(item);
            const title = item.find('.card-title > a').attr('title').trim();
            let link = item.find('.card-title > a').attr('href');
            link = link.startsWith('/') ? host + link : link;
            const pubDate = timezone(parseDate(item.find('time').text().replace('发布时间：', ''), 'YYYY-MM-DD'), +8);
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
