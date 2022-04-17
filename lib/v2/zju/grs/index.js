const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const host = 'http://www.grs.zju.edu.cn/';

const map = new Map([
    [1, { title: '浙大研究生院 -- 全部公告', tag: '1335' }],
    [2, { title: '浙大研究生院 -- 教学管理', tag: '1336' }],
    [3, { title: '浙大研究生院 -- 各类资助', tag: '1337' }],
    [4, { title: '浙大研究生院 -- 学科建设', tag: '1338' }],
    [5, { title: '浙大研究生院 -- 海外交流', tag: '1339' }],
]);

module.exports = async (ctx) => {
    const type = parseInt(ctx.params.type);
    const tag = map.get(type).tag;
    const url = `${host}${tag}/list.htm`;
    const res = await got(url);

    const $ = cheerio.load(res.data);
    const list = $('#wp_news_w24').find('.list_nav');

    const items =
        list &&
        list
            .map((index, item) => {
                item = $(item);
                return {
                    title: item.find('.list_tit').children('a').attr('title'),
                    pubDate: parseDate(item.find('.list_time').text()),
                    link: `http://www.grs.zju.edu.cn/${item.find('a').eq(-1).attr('href')}`,
                    description: item.find('.list_intro a').text(),
                };
            })
            .get();

    ctx.state.data = {
        title: map.get(type).title,
        link: `${host}${tag}/list.htm`,
        item: items,
    };
};
