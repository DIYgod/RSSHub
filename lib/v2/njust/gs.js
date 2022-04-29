const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');
const { getContent } = require('./utils');

const map = new Map([
    ['tzgg', { title: '南京理工大学研究生院 -- 通知公告', id: '/sytzgg_4568' }],
    ['xsgg', { title: '南京理工大学研究生院 -- 学术公告', id: '/xshdggl' }],
]);

const host = 'https://gs.njust.edu.cn';

module.exports = async (ctx) => {
    const type = ctx.params.type || 'tzgg';
    const info = map.get(type);
    if (!info) {
        throw 'invalid type';
    }
    const id = info.id;

    const html = await getContent(host + id + '/list.htm');
    const $ = cheerio.load(html);
    const list = $('ul.news_ul').find('li');

    const items = await Promise.all(
        list.map(async (index, item) => {
            const url = $(item).find('a').attr('href');
            let desc = '';
            if (url.startsWith('/')) {
                const data = await getContent(host + url);
                desc = cheerio.load(data)('.wp_articlecontent').html();
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
