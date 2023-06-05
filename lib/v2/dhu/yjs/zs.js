const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timeZone = require('@/utils/timezone');

const baseUrl = 'https://yjszs.dhu.edu.cn';

const map = {
    doctor: '/7126/list.htm',
    master: '/7128/list.htm',
};
module.exports = async (ctx) => {
    const type = ctx.params.type || 'master';
    const link = `${baseUrl}${map[type]}`;
    const { data: response } = await got(link);

    const $ = cheerio.load(response);

    const items = $('.list_item')
        .map((_, elem) => ({
            link: new URL($('a', elem).attr('href'), baseUrl).href,
            title: $('a', elem).attr('title'),
            pubDate: timeZone(parseDate($('.Article_PublishDate', elem).text()), +8),
        }))
        .get();

    ctx.state.data = {
        title: '东华大学研究生-' + $('.col_title').text(),
        link,
        item: items,
    };
};
