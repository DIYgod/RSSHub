const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const host = 'http://www.cst.zju.edu.cn/';

const map = new Map([
    [0, { id: '', title: '浙大软件学院-全部通知' }],
    [1, { id: '32178/list.htm', title: '浙大软件学院-招生信息' }],
    [2, { id: '36216/list.htm', title: '浙大软件学院-教务管理' }],
    [3, { id: '36217/list.htm', title: '浙大软件学院-论文管理' }],
    [4, { id: '36224/list.htm', title: '浙大软件学院-思政工作' }],
    [5, { id: '36228/list.htm', title: '浙大软件学院-评奖评优' }],
    [6, { id: '36233/list.htm', title: '浙大软件学院-实习就业' }],
    [7, { id: '36235/list.htm', title: '浙大软件学院-国际实习' }],
    [8, { id: '36194/list.htm', title: '浙大软件学院-国内合作科研' }],
    [9, { id: '36246/list.htm', title: '浙大软件学院-国际合作科研' }],
    [10, { id: '36195/list.htm', title: '浙大软件学院-校园服务' }],
]);

async function getPage(id) {
    const res = await got({
        method: 'get',
        url: host + id,
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
                    pubDate: parseDate(item.find('.fr').text()),
                    link: item.find('a').attr('href'),
                };
            })
            .get()
    );
}

module.exports = async (ctx) => {
    const type = parseInt(ctx.params.type);
    const link = host + map.get(type).id;
    let items = [];
    if (type === 0) {
        const tasks = [];
        for (const value of map.values()) {
            tasks.push(getPage(value.id));
        }
        const results = await Promise.all(tasks);
        results.forEach((result) => {
            items = items.concat(result);
        });
    } else {
        items = await getPage(map.get(type).id);
    }

    const out = await Promise.all(
        items.map((item) => {
            const itemUrl = host + item.link;
            return ctx.cache.tryGet(itemUrl, async () => {
                const response = await got({
                    method: 'get',
                    url: itemUrl,
                    headers: {
                        Referer: link,
                    },
                });
                const $ = cheerio.load(response.data);
                const description = $('.vid_wz').html();
                return {
                    title: item.title,
                    link: itemUrl,
                    description,
                    pubDate: item.pubDate,
                };
            });
        })
    );

    ctx.state.data = {
        title: map.get(type).title,
        link,
        item: out,
    };
};
