const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

const host = 'https://www.epe.sdu.edu.cn/';
const typelist = ['学院动态', '通知公告', '学术论坛'];
const urlList = ['zxzx/xydt.htm', 'zxzx/tzgg.htm', 'zxzx/xslt.htm'];

module.exports = async (ctx) => {
    const type = ctx.params.type ? parseInt(ctx.params.type) : 0;
    const link = new URL(urlList[type], host).href;
    const response = await got(link);

    const $ = cheerio.load(response.data);

    let item = $('#page_right_main li a')
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
            .filter((e) => e.link.startsWith('../info'))
            .map((item) => {
                item.link = new URL(item.link.slice('3'), host).href;
                return ctx.cache.tryGet(item.link, async () => {
                    const response = await got(item.link);
                    const $ = cheerio.load(response.data);

                    const info = $('#show_info').text().split(/\s{4}/);
                    const date = info[0].split('：')[1];

                    item.title = $('#show_title').text().trim();
                    item.author = info[1].replace('编辑：', '') || '山东大学能源与动力工程学院';
                    item.description = $('#show_content').html();
                    item.pubDate = timezone(parseDate(date), +8);

                    return item;
                });
            })
    );

    ctx.state.data = {
        title: `山东大学能源与动力工程学院${typelist[type]}`,
        description: $('title').text(),
        link,
        item,
    };
};
