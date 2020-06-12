const got = require('@/utils/got');
const cheerio = require('cheerio');
const util = require('../utils');

module.exports = async (ctx) => {
    const type = ctx.params.type;
    let title, path;
    switch (type) {
        case 'zonghe':
            title = '综合新闻';
            path = 'zhxw.htm';
            break;
        case 'zhuanti':
            title = '专题新闻';
            path = 'ztxw_new.htm';
            break;
        case 'renwu':
            title = '北航人物';
            path = 'bhrw.htm';
            break;
        case 'fengcai':
            title = '校园风采';
            path = 'xyfc_new.htm';
            break;
        case 'kejiao':
            title = '科教在线';
            path = 'kjzx_new.htm';
            break;
        case 'meiti':
            title = '媒体北航';
            path = 'mtbh_new.htm';
            break;
        case 'gonggao':
            title = '信息公告';
            path = 'xxgg_new.htm';
            break;
        case 'xueshuwenhua':
            title = '学术文化';
            path = 'xsjwhhd_new.htm';
            break;
        default:
            title = '综合新闻';
            path = 'zhxw_new.htm';
    }

    const response = await got({
        method: 'get',
        url: 'https://news.buaa.edu.cn/' + path,
        headers: {
            Referer: 'https://news.buaa.edu.cn',
        },
    });

    const $ = cheerio.load(response.data);

    const list = $('.mainleft > .listlefttop > .listleftop1').slice(0, 10).get();

    const result = await util.ProcessFeed(list, ctx.cache);

    ctx.state.data = {
        title: '北航新闻 - ' + title,
        link: 'https://news.buaa.edu.cn/' + path,
        description: '北京航空航天大学新闻网 - ' + title,
        item: result,
    };
};
