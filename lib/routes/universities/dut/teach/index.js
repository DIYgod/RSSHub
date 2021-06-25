const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');
const typeMap = new Map([
    ['zytg', { title: '大连理工大学教务处-重要通告', url: 'https://teach.dlut.edu.cn/zytg/zytg.htm', basePath: 'https://teach.dlut.edu.cn/zytg/' }],
    ['xwkd', { title: '大连理工大学教务处-新闻快递', url: 'https://teach.dlut.edu.cn/xwkd/xwkd.htm', basePath: 'https://teach.dlut.edu.cn/xwkd/' }],
    ['qitawenjian', { title: '大连理工大学教务处-其他文件', url: 'https://teach.dlut.edu.cn/qitawenjian/list.jsp?urltype=tree.TreeTempUrl&wbtreeid=1081', basePath: 'https://teach.dlut.edu.cn/qitawenjian/' }],
    ['jiaoxuewenjian', { title: '大连理工大学教务处-教学文件', url: 'https://teach.dlut.edu.cn/jiaoxuewenjian/list.jsp?urltype=tree.TreeTempUrl&wbtreeid=1082', basePath: 'https://teach.dlut.edu.cn/jiaoxuewenjian/' }],
]);
module.exports = async (ctx) => {
    const frontUrl = typeMap.get(ctx.params.type).url;
    const basePath = typeMap.get(ctx.params.type).basePath;
    const response = await got({
        method: 'get',
        url: frontUrl,
    });

    const data = response.data;
    const $ = cheerio.load(data);
    const list = $('.list > ul > li')
        .map((index, item) => {
            item = $(item);
            return {
                title: item.find('a').attr('title'),
                // description: description,
                link: item.find('a').attr('href'),
                pubDate: timezone(parseDate(item.find('span').text(), 'YYYY/MM/DD'), +8),
            };
        })
        .get();

    const entries = await Promise.all(
        list.map(async (item) => {
            const { title, link, pubDate } = item;
            const entryUrl = basePath + link;

            const cache = await ctx.cache.tryGet(entryUrl, async () => {
                const response = await got({
                    method: 'get',
                    url: entryUrl,
                });

                const $ = cheerio.load(response.data);
                const description = (() => {
                    const main = $('.v_news_content').html();
                    const attachment = $('form ul').html();
                    return main + '<br>' + (attachment ? attachment : '');
                })();
                const entry = {
                    title: title,
                    link: link,
                    pubDate: pubDate,
                    description: description,
                };
                return JSON.stringify(entry);
            });
            return Promise.resolve(JSON.parse(cache));
        })
    );

    ctx.state.data = {
        title: typeMap.get(ctx.params.type).title,
        link: frontUrl,
        item: entries,
    };
};
