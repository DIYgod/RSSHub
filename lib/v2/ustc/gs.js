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
    const type = ctx.params.type || 'tzgg';
    const info = map.get(type);
    if (!info) {
        throw 'invalid type';
    }
    const id = info.id;

    const response = await got(`${host}/column/${id}`);
    const $ = cheerio.load(response.data);
    const list = $('div.r-box > ul').find('li');

    const items = await Promise.all(
        list.map(async (index, item) => {
            const url = $(item).find('a').attr('href');
            let desc = '';
            if (url.startsWith('/article')) {
                const response = await got(host + url);
                desc = cheerio.load(response.data)('article.article').html();
            }

            return {
                title: $(item).find('a').text().trim(),
                description: desc,
                pubDate: timezone(parseDate($(item).find('time').text(), 'YYYY-MM-DD'), +8),
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
