const got = require('@/utils/got');
const cheerio = require('cheerio');

const host = 'http://www.cst.zju.edu.cn/index.php?c=Index&a=tlist&catid=';

const map = new Map([
    [1, { id: '2', title: '浙大软件学院-招生信息' }],
    [2, { id: '3', title: '浙大软件学院-教学管理' }],
    [3, { id: '4', title: '浙大软件学院-思政工作' }],
    [4, { id: '6', title: '浙大软件学院-实习就业' }],
    [5, { id: '7', title: '浙大软件学院-合作科研' }],
]);

async function getPage(id) {
    const res = await got({
        method: 'get',
        url: host + `${id}`,
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
            link: host + 'NULL',
            item: items,
        };
    } else {
        const id = map.get(type).id;
        ctx.state.data = {
            title: map.get(type).title,
            link: host + `${id}`,
            item: await getPage(id),
        };
    }
};
