const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

const typelist = ['通知公告', '院所新闻', '教学信息', '学术动态', '学院简报'];
const urlList = ['xwdt/tzgg.htm', 'xwdt/ysxw.htm', 'xwdt/jxxx.htm', 'xwdt/xsdt.htm', 'xwdt/xyjb.htm'];
const host = 'https://www.mech.sdu.edu.cn/';

module.exports = async (ctx) => {
    const type = ctx.params.type ? parseInt(ctx.params.type) : 0;
    const link = new URL(urlList[type], host).href;
    const response = await got(link);

    const $ = cheerio.load(response.data);

    let item = $('#page_list li a')
        .slice(0, 1)
        .map((_, e) => {
            e = $(e);
            return {
                title: e.attr('title'),
                link: e.attr('href'),
            };
        })
        .get();

    item = await Promise.all(
        item
            .filter((e) => e.link.startsWith('../info') || e.link.startsWith('https://www.rd.sdu.edu.cn/'))
            .map((item) => {
                const isFromMech = item.link.startsWith('../info');
                if (isFromMech) {
                    item.link = new URL(item.link.slice('3'), host).href;
                }
                return ctx.cache.tryGet(item.link, async () => {
                    const response = await got(item.link);
                    const $ = cheerio.load(response.data);

                    const info = $('#show_info').text().split(/\s{4}/);
                    const date = info[0].split('：')[1];

                    item.title = $('#show_title').text().trim();
                    item.author = info[1].replace('作者：', '') || '山东大学机械工程学院';
                    $('#show_title, #show_info').remove();
                    item.description = $('form[name=_newscontent_fromname] div').html();
                    item.pubDate = timezone(parseDate(date), +8);

                    return item;
                });
            })
    );

    ctx.state.data = {
        title: `山东大学机械工程学院${typelist[type]}`,
        description: $('title').text(),
        link,
        item,
    };
};
