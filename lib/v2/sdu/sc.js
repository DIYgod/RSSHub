const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const host = 'https://www.sc.sdu.edu.cn/';
const typelist = ['通知公告', '学术动态', '本科教育', '研究生教育'];
const urlList = ['tzgg.htm', 'kxyj/xsyg.htm', 'rcpy/bkjy.htm', 'rcpy/yjsjy.htm'];

module.exports = async (ctx) => {
    const type = ctx.params.type ? parseInt(ctx.params.type) : 0;
    const link = new URL(urlList[type], host).href;
    const response = await got(link);

    const $ = cheerio.load(response.data);

    let item = $('.newlist01 li')
        .map((_, e) => {
            e = $(e);
            const a = e.find('a');
            let link = a.attr('href');
            link = new URL(link, host).href;
            return {
                title: a.text().trim(),
                link,
                pubDate: parseDate(e.find('.date').text().trim()),
            };
        })
        .get();

    item = await Promise.all(
        item.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                try {
                    const response = await got(item.link);
                    const $ = cheerio.load(response.data);

                    item.title = $('h3').text();
                    item.author =
                        $('.pr')
                            .text()
                            .trim()
                            .match(/作者：(.*)/)[1] || '山东大学软件学院';
                    $('h3, .pr').remove();
                    item.description = $('.content').html();

                    return item;
                } catch (e) {
                    // intranet oa.sdu.edu.cn
                    return item;
                }
            })
        )
    );

    ctx.state.data = {
        title: `山东大学软件学院${typelist[type]}`,
        description: $('title').text(),
        link,
        item,
    };
};
