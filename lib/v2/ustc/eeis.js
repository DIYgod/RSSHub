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
    const type = ctx.params.type || 'tzgg';
    const info = map.get(type);
    if (!info) {
        throw 'invalid type';
    }
    const id = info.id;

    const response = await got(`${host}/${id}/list.htm`);
    const $ = cheerio.load(response.data);
    const list = $('div[portletmode=simpleList]').find('div.newslist');

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
                pubDate: timezone(parseDate($(item).find('.text-secondary').text() + '/' + $(item).find('.text-primary').text(), 'YYYY/MM/DD'), +8),
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
