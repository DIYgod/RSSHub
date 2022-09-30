const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

const host = 'http://www.grs.zju.edu.cn/';

const map = new Map([
    [1, { title: '浙大研究生院 -- 全部公告', tag: 'qbgg' }],
    [2, { title: '浙大研究生院 -- 教学管理', tag: 'jxgl' }],
    [3, { title: '浙大研究生院 -- 各类资助', tag: 'glzz' }],
    [4, { title: '浙大研究生院 -- 学科建设', tag: 'xkjs' }],
    [5, { title: '浙大研究生院 -- 海外交流', tag: 'hwjl' }],
]);

module.exports = async (ctx) => {
    const type = parseInt(ctx.params.type);
    const tag = map.get(type).tag;
    const url = `${host}${tag}/list.htm`;
    const res = await got(url);

    const $ = cheerio.load(res.data);
    const list = $('#wp_news_w09').find('.list-item');

    const items =
        list &&
        list
            .map((index, item) => {
                item = $(item);
                return {
                    title: item.find('h3').attr('title'),
                    pubDate: timezone(parseDate(item.find('.date').text().trim(), 'YY-MM-DD'), +8),
                    link: `http://www.grs.zju.edu.cn${item.find('a').eq(-1).attr('href')}`,
                    description: item.find('p').text(),
                };
            })
            .get();

    ctx.state.data = {
        title: map.get(type).title,
        link: `${host}${tag}/list.htm`,
        item: items,
    };
};
