const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timeZone = require('@/utils/timezone');

const baseURL = 'https://yjszs.dhu.edu.cn';

const map = {
    doctor: '/7126/list.htm',
    master: '/7128/list.htm',
};
module.exports = async (ctx) => {
    const type = ctx.params.type;
    const link = map.hasOwnProperty(type) ? `${baseURL}${map[type]}` : `${baseURL}/7128/list.htm`;
    const response = await got({
        method: 'get',
        url: link,
        responseType: 'buffer',
        headers: {
            Referer: baseURL,
        },
    });

    const $ = cheerio.load(response.data);
    ctx.state.data = {
        link: baseURL,
        title: '东华大学研究生-' + $('.col_title').text(),
        item: $('.list_item')
            .map((_, elem) => ({
                link: new URL($('a', elem).attr('href'), baseURL).href,
                title: $('a', elem).attr('title'),
                pubDate: timeZone(parseDate($('.Article_PublishDate', elem).text()), +8),
            }))
            .get(),
    };
};
