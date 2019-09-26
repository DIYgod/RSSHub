const got = require('@/utils/got');
const cheerio = require('cheerio');

const host = 'http://www.cst.zju.edu.cn/index.php?c=Index&a=tlist&catid=';

const map = new Map([
                [1, { id: '2', title: '招生信息' }],
                [2, { id: '3', title: '教学管理' }],
                [3, { id: '4', title: '思政工作' }],
                [4, { id: '6', title: '实习就业' }],
                [5, { id: '7', title: '合作科研' }],
            ]);

module.exports = async (ctx) => {
    const type = Number.parseInt(ctx.params.type);
    const id = map.list[type].id;
    const res = await got({
        method: 'get',
        url: host + `${id}`
    });

    const $ = cheerio.load(res.data);
    const list = $('.lm_new')
        .find('li');

    const items =
        list &&
        list
            .map((index, item) => {
                item = $(item);
                return {
                    title: item.find('font').text(),
                    pubDate: new Date(item.find('.fr').text()).toUTCString(),
                    link: `http://cst.zju.edu.cn/${item.find('a').attr('href')}`,
                };
            })
            .get();

    ctx.state.data = {
        title: map.get(type).title,
        link: host + `${id}`,
        item: items,
    };
};