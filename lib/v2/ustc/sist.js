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
    const type = ctx.params.type || 'tzgg';
    const info = map.get(type);
    if (!info) {
        throw 'invalid type';
    }
    const id = info.id;

    const response = await got(`${host}/${id}/list.htm`);
    const $ = cheerio.load(response.data);
    const list = $('div#wp_news_w12').find('li');

    const items = await Promise.all(
        list.map(async (index, item) => {
            const url = $(item).find('a').attr('href');
            let desc = '';
            if (url.startsWith('/')) {
                const response = await got(host + url);
                desc = cheerio.load(response.data)('div.wp_articlecontent').html();
            }

            return {
                title: $(item).find('a').attr('title').trim(),
                description: desc,
                pubDate: timezone(parseDate($(item).find('span').text(), 'YYYY-MM-DD'), +8),
                link: url,
            };
        })
    );

    ctx.state.data = {
        title: info.title,
        link: host,
        item: items,
    };
};
