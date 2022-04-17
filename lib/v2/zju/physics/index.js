const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

// const host = 'http://physics.zju.edu.cn/redir.php?catalog_id=';
const host = 'http://physics.zju.edu.cn';
// const host = 'http://10.14.122.238/redir.php?catalog_id=';

const map = new Map([
    [1, { title: '浙大物理学院 -- 本院动态', id: '39060' }],
    [2, { title: '浙大物理学院 -- 科研进展', id: '39070' }],
    [3, { title: '浙大物理学院 -- 研究生教育最新消息', id: '39079' }],

    // could not find these sections due to http://physics.zju.edu.cn/2022/0325/c39060a2510676/page.htm
    /*    [4, { title: '浙大物理学院 -- 学生思政最新消息', id: '112' }],
    [5, { title: '浙大物理学院 -- 研究生思政消息公告', id: '155' }],
    [6, { title: '浙大物理学院 -- 研究生奖助学金', id: '661' }],
    [7, { title: '浙大物理学院 -- 研究生思政就业信息', id: '664' }],
    [8, { title: '浙大物理学院 -- 本科生思政消息公告', id: '667' }],
    [9, { title: '浙大物理学院 -- 本科生奖助学金', id: '670' }],
    [10, { title: '浙大物理学院 -- 本科生就业信息', id: '671' }],
    [11, { title: '浙大物理学院 -- 学术报告', id: '3735' }],*/
]);

module.exports = async (ctx) => {
    const type = parseInt(ctx.params.type);
    const id = map.get(type).id;
    const res = await got({
        method: 'get',
        url: `${host}/${id}/list.htm`,
    });

    const $ = cheerio.load(res.data);
    const items = $('#arthd li')
        .map((index, item) => {
            item = $(item);
            return {
                title: item.find('a').attr('title'),
                pubDate: parseDate(item.find('.art-date').text()),

                link: `http://physics.zju.edu.cn/${item.find('a').attr('href')}`,
                // link: `http://10.14.122.238/${item.find('a').attr('href')}`,
            };
        })
        .get();

    ctx.state.data = {
        title: map.get(type).title,
        link: `${host}${id}`,
        item: items,
    };
};
