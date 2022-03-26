const got = require('@/utils/got');
const cheerio = require('cheerio');

const host = 'http://grs.zju.edu.cn/redir.php?catalog_id=16313';

const map = new Map([
    [1, { title: '浙大研究生院 -- 全部公告', tag: '' }],
    [2, { title: '浙大研究生院 -- 教学管理', tag: '&tag=%E6%95%99%E5%AD%A6%E7%AE%A1%E7%90%86' }],
    [3, { title: '浙大研究生院 -- 各类资助', tag: '&tag=%E5%90%84%E7%B1%BB%E8%B5%84%E5%8A%A9' }],
    [4, { title: '浙大研究生院 -- 学科建设', tag: '&tag=%E5%AD%A6%E7%A7%91%E5%BB%BA%E8%AE%BE' }],
    [5, { title: '浙大研究生院 -- 海外交流', tag: '&tag=%E6%B5%B7%E5%A4%96%E4%BA%A4%E6%B5%81' }],
]);

module.exports = async (ctx) => {
    const type = Number.parseInt(ctx.params.type);
    const tag = map.get(type).tag;
    const res = await got({
        method: 'get',
        url: `${host}${tag}`,
    });

    const $ = cheerio.load(res.data);
    const list = $('.cg-pic-news-list').find('li').slice(0, 20);

    const items =
        list &&
        list
            .map((index, item) => {
                item = $(item);
                return {
                    title: item.find('a').text(),
                    pubDate: new Date(item.find('.art-dateee').text()).toUTCString(),
                    link: `http://grs.zju.edu.cn/${item.find('a').eq(-1).attr('href')}`,
                    description: item.find('div').text(),
                };
            })
            .get();

    ctx.state.data = {
        title: map.get(type).title,
        link: `${host}${tag}`,
        item: items,
    };
};
