const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');

const host = 'http://www.epe.sdu.edu.cn/';
const typelist = ['学院动态', '通知公告', '学术论坛'];
const urlList = ['zxzx/xydt.htm', 'zxzx/tzgg.htm', 'zxzx/xslt.htm'];

module.exports = async (ctx) => {
    const type = parseInt(ctx.params.type) || 0;
    const link = url.resolve(host, urlList[type]);
    const response = await got.get(link);

    const $ = cheerio.load(response.data);

    const list = $('#page_right_main li a')
        .slice(0, 10)
        .map((i, e) => $(e).attr('href'))
        .get();

    const out = await Promise.all(
        list
            .filter((e) => e.startsWith('../info'))
            .map(async (itemUrl) => {
                itemUrl = url.resolve(host, itemUrl.slice('3'));
                const cache = await ctx.cache.get(itemUrl);
                if (cache) {
                    return Promise.resolve(JSON.parse(cache));
                }

                const response = await got.get(itemUrl);
                const $ = cheerio.load(response.data);

                const rawDate = $('#show_info').text().split(/\s{4}/);
                const date = rawDate[0].split('：')[1];

                const single = {
                    title: $('#show_title').text().trim(),
                    link: itemUrl,
                    author: '山东大学能源与动力工程学院',
                    description: $('#show_content').html(),
                    pubDate: new Date(date),
                };
                ctx.cache.set(itemUrl, JSON.stringify(single));
                return Promise.resolve(single);
            })
    );

    ctx.state.data = {
        title: `山东大学能源与动力工程学院${typelist[type]}`,
        link,
        item: out,
    };
};
