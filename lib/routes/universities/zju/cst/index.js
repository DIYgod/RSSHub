const got = require('@/utils/got');
const cheerio = require('cheerio');

const host = 'http://www.cst.zju.edu.cn/';

const map = new Map([
    [1, { id: '32178', title: '浙大软件学院-招生信息' }],
    [2, { id: '36216', title: '浙大软件学院-教务管理' }],
    [3, { id: '36217', title: '浙大软件学院-论文管理' }],
    [4, { id: '36224', title: '浙大软件学院-思政工作' }],
    [5, { id: '36228', title: '浙大软件学院-评奖评优' }],
    [6, { id: '36233', title: '浙大软件学院-实习就业' }],
    [7, { id: '36235', title: '浙大软件学院-国际实习' }],
    [8, { id: '36194', title: '浙大软件学院-国内合作科研' }],
    [9, { id: '36246', title: '浙大软件学院-国际合作科研' }],
]);

async function getPage(id) {
    const res = await got({
        method: 'get',
        url: host + `${id}` + '/list.htm',
    });

    const $ = cheerio.load(res.data);
    const list = $('.lm_new').find('li');

    return (
        list &&
        list
            .map((index, item) => {
                item = $(item);
                return {
                    title: item.find('a').text(),
                    pubDate: new Date(item.find('.fr').text()).toUTCString(),
                    link: `http://www.cst.zju.edu.cn/${item.find('a').attr('href')}`,
                };
            })
            .get()
    );
}

module.exports = async (ctx) => {
    const type = Number.parseInt(ctx.params.type);
    if (type === 0) {
        const tasks = [];
        for (const value of map.values()) {
            tasks.push(getPage(value.id));
        }
        const results = await Promise.all(tasks);
        let items = [];
        results.forEach((result) => {
            items = items.concat(result);
        });
        ctx.state.data = {
            title: '浙大软件学院-全部通知',
            link: host,
            item: items,
        };
    } else {
        const id = map.get(type).id;
        ctx.state.data = {
            title: map.get(type).title,
            link: host + `${id}` + '/list.htm',
            item: await getPage(id),
        };
    }
};
