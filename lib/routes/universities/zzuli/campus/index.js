const got = require('@/utils/got');
const cheerio = require('cheerio');

const map = new Map([
    [0, { title: '公告信息', link: 'http://info.zzuli.edu.cn/_t961/2464/list.htm' }],
    [1, { title: '学工信息', link: 'http://info.zzuli.edu.cn/_t961/xsxx/list.htm' }],
    [2, { title: '教学信息', link: 'http://info.zzuli.edu.cn/_t961/jwxx/list.htm' }],
    [3, { title: '信息快递', link: 'http://info.zzuli.edu.cn/_t961/2536/list.htm' }],
    [4, { title: '学术报告', link: 'http://info.zzuli.edu.cn/_t961/xsbg/list.htm' }],
    [5, { title: '科研信息', link: 'http://info.zzuli.edu.cn/_t961/kyxx/list.htm' }],
    [6, { title: '网络公告', link: 'http://info.zzuli.edu.cn/_s19/_t960/wlgg/list.psp' }],
    [7, { title: '班车查询', link: 'http://info.zzuli.edu.cn/_s19/_t960/2619/list.htm' }],
    [8, { title: '周会表', link: 'http://info.zzuli.edu.cn/_s19/_t960/bzhy/list.psp' }],
]);

module.exports = async (ctx) => {
    const type = Number.parseInt(ctx.params.type);
    const id = map.get(type).link;
    const res = await got({
        method: 'get',
        url: `${id}`,
        responseType: 'buffer',
    });

    const $ = cheerio.load(res.data);
    const list = $('.lists tr').slice(0, 10);
    const items =
        list &&
        list
            .map((index, item) => {
                item = $(item);
                return {
                    title: item.find('td a').attr('title'),
                    link: item.find('td a').attr('href'),
                    pubDate: new Date(item.find('td div').text()),
                };
            })
            .get();

    ctx.state.data = {
        title: map.get(type).title + ' - 郑州轻工业大学智慧门户',
        link: map.get(type).link,
        item: items,
    };
};
