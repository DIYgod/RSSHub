const got = require('@/utils/got');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');

const host = 'http://physics.zju.edu.cn/redir.php?catalog_id=';
// const host = 'http://10.14.122.238/redir.php?catalog_id=';

const map = new Map([
    [1, { title: '浙大物理系 -- 本系动态', id: '66' }],
    [2, { title: '浙大物理系 -- 科研通知', id: '88' }],
    [3, { title: '浙大物理系 -- 研究生教育最新消息', id: '104' }],
    [4, { title: '浙大物理系 -- 学生思政最新消息', id: '112' }],
    [5, { title: '浙大物理系 -- 研究生思政消息公告', id: '155' }],
    [6, { title: '浙大物理系 -- 研究生奖助学金', id: '661' }],
    [7, { title: '浙大物理系 -- 研究生思政就业信息', id: '664' }],
    [8, { title: '浙大物理系 -- 本科生思政消息公告', id: '667' }],
    [9, { title: '浙大物理系 -- 本科生奖助学金', id: '670' }],
    [10, { title: '浙大物理系 -- 本科生就业信息', id: '671' }],
    [11, { title: '浙大物理系 -- 学术报告', id: '3735' }],
]);

module.exports = async (ctx) => {
    const type = Number.parseInt(ctx.params.type);
    const id = map.get(type).id;
    const res = await got({
        method: 'get',
        url: `${host}${id}`,
        responseType: 'buffer',
    });

    const $ = cheerio.load(iconv.decode(res.data, 'gb2312'));
    const list = $('.art_list').find('li').slice(0, 20);

    const items =
        list &&
        list
            .map((index, item) => {
                item = $(item);
                return {
                    title: item.find('a').text(),
                    // title: item.find('a').attr('title'),
                    pubDate: new Date(item.find('.date').text()).toUTCString(),

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
