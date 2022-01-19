const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const category_dict = {
        gyfytdglk: '公用房与土地管理科',
        zfglk: '住房管理科',
        xxzhk: '信息综合科',
        czcjk: '出租出借科',
        gyzcglk: '国有资产管理科',
    };

    const items = [];
    const response = {};
    response.gyfytdglk = await got({
        method: 'get',
        url: 'https://zcc.nju.edu.cn/tzgg/gyfytdglk/index.html',
    });
    response.zfglk = await got({
        method: 'get',
        url: 'https://zcc.nju.edu.cn/tzgg/zfglk/index.html',
    });
    response.xxzhk = await got({
        method: 'get',
        url: 'https://zcc.nju.edu.cn/tzgg/xxzhk/index.html',
    });
    response.czcjk = await got({
        method: 'get',
        url: 'https://zcc.nju.edu.cn/tzgg/czcjk/index.html',
    });
    response.gyzcglk = await got({
        method: 'get',
        url: 'https://zcc.nju.edu.cn/tzgg/gyzcglk/index.html',
    });

    for (const c in category_dict) {
        const data = response[c].data;

        const $ = cheerio.load(data);
        let script = $('ul.list_news_dl').find('script');
        script = script['1'].children[0].data;

        const start = script.indexOf('[');
        const end = script.lastIndexOf(']');

        const t = JSON.parse(script.substring(start, end + 1));

        t[0].infolist.forEach((item) => {
            items.push({
                title: item.title,
                description: item.summary,
                link: item.url,
                author: item.username,
                pubDate: new Date(item.releasetime).toUTCString(),
                category: category_dict[c],
            });
        });
    }

    ctx.state.data = {
        title: '资产管理处-通知公告',
        link: 'https://zcc.nju.edu.cn/tzgg/index.html',
        item: items,
    };
};
