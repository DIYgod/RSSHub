const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');
const typeMap = new Map([
    ['xstong_zhi', { title: '大连理工大学国际处及港澳台办-学生通知', url: 'http://dutdice.dlut.edu.cn/tzgg/xstong_zhi.htm', basePath: 'http://dutdice.dlut.edu.cn/tzgg/' }],
    ['jstz', { title: '大连理工大学国际处及港澳台办-教师通知', url: 'http://dutdice.dlut.edu.cn/tzgg/jstz.htm', basePath: 'http://dutdice.dlut.edu.cn/tzgg/' }],
    ['xwsd', { title: '大连理工大学国际处及港澳台办-新闻速递', url: 'http://dutdice.dlut.edu.cn/xwsd/xxxw.htm', basePath: 'http://dutdice.dlut.edu.cn/xwsd/' }],
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
    const list = $('.list01 li')
        .map((index, item) => {
            item = $(item);
            return {
                title: item.find('a').text(),
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
                const description = $('form[name="_newscontent_fromname"]').html();
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
