const got = require('@/utils/got');
const iconv = require('iconv-lite');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

const base_url = 'https://jw.dhu.edu.cn';

const map = {
    student: '/tzggwxszl/list.htm',
    teacher: '/tzggwjszl/list.htm',
};
module.exports = async (ctx) => {
    const type = ctx.params.type;
    const link = map.hasOwnProperty(type) ? `${base_url}${map[type]}` : `${base_url}/tzggwxszl/list.htm`;
    const response = await got({
        method: 'get',
        url: link,
        responseType: 'buffer',
        headers: {
            Referer: base_url,
        },
    });

    const $ = cheerio.load(iconv.decode(response.data, 'utf-8'));
    ctx.state.data = {
        link: base_url,
        title: '东华大学教务处-' + $('.col_title').text(),
        item: $('.list_item')
            .map((_, elem) => ({
                link: new URL($('a', elem).attr('href'), base_url),
                title: $('a', elem).attr('title'),
                pubDate: timezone(parseDate($('.Article_PublishDate', elem).text()), +8),
            }))
            .get(),
    };
};
