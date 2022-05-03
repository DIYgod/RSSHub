const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');
const { getContent } = require('./utils');

const map = new Map([
    ['tzgg', { title: '南京理工大学财务处 -- 通知公告', id: '/12432' }],
    ['bslc', { title: '南京理工大学财务处 -- 办事流程', id: '/1382' }],
]);

const host = 'https://cwc.njust.edu.cn';

module.exports = async (ctx) => {
    const type = ctx.params.type ?? 'tzgg';
    const info = map.get(type);
    if (!info) {
        throw 'invalid type';
    }
    const id = info.id;
    const siteUrl = host + id + '/list.htm';

    const html = await getContent(siteUrl, true);
    const $ = cheerio.load(html);
    const list = $('ul.news_list').find('li');

    ctx.state.data = {
        title: info.title,
        link: siteUrl,
        item:
            list &&
            list
                .map((index, item) => ({
                    title: $(item).find('a').attr('title').trim(),
                    pubDate: timezone(parseDate($(item).find('span.news_meta').text(), 'YYYY-MM-DD'), +8),
                    link: $(item).find('a').attr('href'),
                }))
                .get(),
    };
};
