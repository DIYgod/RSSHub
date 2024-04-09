const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const host = 'http://www.cmse.sdu.edu.cn/';
const typelist = ['通知公告', '学院新闻', '本科生教育', '研究生教育', '学术动态'];
const urlList = ['zxzx/tzgg.htm', 'zxzx/xyxw.htm', 'zxzx/bksjy.htm', 'zxzx/yjsjy.htm', 'zxzx/xsdt.htm'];

module.exports = async (ctx) => {
    const type = ctx.params.type ? parseInt(ctx.params.type) : 0;
    const link = new URL(urlList[type], host).href;
    const response = await got(link);

    const $ = cheerio.load(response.data);

    let item = $('.article_list li')
        .map((_, e) => {
            e = $(e);
            const a = e.find('a');
            return {
                title: a.text().trim(),
                link: a.attr('href'),
                pubDate: parseDate(e.find('.date').text(), 'YYYY/MM/DD'),
            };
        })
        .get();

    item = await Promise.all(
        item
            .filter((e) => e.link.startsWith('../info'))
            .map((item) => {
                item.link = new URL(item.link.slice('3'), host).href;
                return ctx.cache.tryGet(item.link, async () => {
                    const response = await got(item.link);
                    const $ = cheerio.load(response.data);

                    item.title = $('.contentTitle').text();
                    item.author =
                        $('.contentTitle2')
                            .find('span')
                            .eq(1)
                            .text()
                            .trim()
                            .match(/作者：(.*)/)[1] || '山东大学材料科学与工程学院';
                    $('.contentTitle, .contentTitle2').remove();
                    item.description = $('.content_detail').html();

                    return item;
                });
            })
    );

    ctx.state.data = {
        title: `山东大学材料科学与工程学院${typelist[type]}`,
        description: $('title').text(),
        link,
        item,
    };
};
