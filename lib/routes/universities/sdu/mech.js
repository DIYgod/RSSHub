const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');

const typelist = ['通知公告', '院所新闻', '教学信息', '学术动态', '学院简报'];
const urlList = ['xwdt/tzgg.htm', 'xwdt/ysxw.htm', 'xwdt/jxxx.htm', 'xwdt/xsdt.htm', 'xwdt/xyjb.htm'];
const host = 'http://www.mech.sdu.edu.cn/';

module.exports = async (ctx) => {
    const type = parseInt(ctx.params.type) || 0;
    const link = url.resolve(host, urlList[type]);
    const response = await got.get(link);

    const $ = cheerio.load(response.data);

    const list = $('#page_list li a')
        .slice(0, 10)
        .map((i, e) => $(e).attr('href'))
        .get();

    const out = await Promise.all(
        list
            .filter((e) => e.startsWith('../info') || e.startsWith('http://www.rd.sdu.edu.cn/'))
            .map(async (itemUrl) => {
                const isFromMech = itemUrl.startsWith('../info');
                if (isFromMech) {
                    itemUrl = url.resolve(host, itemUrl.slice('3'));
                }
                const cache = await ctx.cache.get(itemUrl);
                if (cache) {
                    return Promise.resolve(JSON.parse(cache));
                }

                const response = await got.get(itemUrl);
                const $ = cheerio.load(response.data);

                const rawDate = $('#show_info').text().split(/\s{4}/);
                let date = rawDate[0].split('：')[1];
                date = date.slice(0, 4) + '-' + date.slice(5, 7) + '-' + date.slice(8, 10) + ' ' + date.slice(11);

                const single = {
                    title: $('#show_title').text().trim(),
                    link: itemUrl,
                    author: '山东大学机械工程学院',
                    description: $('#show_content').html(),
                    pubDate: new Date(date),
                };
                ctx.cache.set(itemUrl, JSON.stringify(single));
                return Promise.resolve(single);
            })
    );

    ctx.state.data = {
        title: `山东大学机械工程学院${typelist[type]}`,
        link,
        item: out,
    };
};
