const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const host = 'https://jwc.zcmu.edu.cn/';

const map = new Map([
    [0, { title: '教务处 -- 教务管理', id: 'jwgl' }],
    [1, { title: '教务处 -- 成绩管理', id: 'jwgl/cjgl' }],
    [2, { title: '教务处 -- 学籍管理', id: 'jwgl/xjgl' }],
    [3, { title: '教务处 -- 考试管理', id: 'jwgl/ksgl' }],
    [4, { title: '教务处 -- 选课管理', id: 'jwgl/xkgl' }],
    [5, { title: '教务处 -- 排课管理', id: 'jwgl/pkgl' }],
]);

module.exports = async (ctx) => {
    const type = parseInt(ctx.params.type);
    const id = map.get(type).id;
    const res = await got({
        method: 'get',
        url: `${host}/${id}.htm`,
    });

    const $ = cheerio.load(res.data);
    const items = $('.winstyle196327 tr:lt(20)')
        .map((index, item) => {
            item = $(item);
            return {
                title: item.find('a').attr('title'),
                link: `https://jwc.zcmu.edu.cn/${item.find('a').attr('href')}`,
                pubDate: parseDate(item.find('span.timestyle196327').text().trim()),
            };
        })
        .get();

    ctx.state.data = {
        title: map.get(type).title,
        link: `${host}${id}`,
        item: items,
    };
};
