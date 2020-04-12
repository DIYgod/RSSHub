const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');

const baseTitle = 'NUIST ESE（南信大环科院）';
const baseUrl = 'http://sese.nuist.edu.cn';
const map = {
    11: '通知公告',
    10: '新闻快讯',
    12: '学术动态',
    6: '学生工作',
    4: '研究生教育',
    3: '本科教育',
};

module.exports = async (ctx) => {
    const category = map.hasOwnProperty(ctx.params.category) ? ctx.params.category : 11;
    const link = baseUrl + '/Showbksjy.aspx?CI=' + category;

    const response = await got.get(link);
    const $ = cheerio.load(response.data);
    const list = $('#ctl00_ctl00_mainbody_rightbody_listcontent_NewsList')
        .find('.gridline')
        .slice(0, 6)
        .map((index, item) => {
            const a = $(item).find('.gridlinediv a');
            return {
                title: a.eq(1).text(),
                link: url.resolve(baseUrl, a.eq(1).attr('href')),
                category: a.first().text(),
                pubDate: new Date($(item).find('.gridlinedate').text().match(/\d+/g)).toUTCString(),
            };
        })
        .get();

    const items = await Promise.all(
        [...list].map(async (item) => {
            const cache = await ctx.cache.get(item.link);
            if (cache) {
                return JSON.parse(cache);
            }

            const response = await got.get(item.link);
            const $ = cheerio.load(response.data);
            const article = $('#ctl00_ctl00_mainbody_rightbody_listcontent_lmnr');

            item.author = article.find('.zzxx span').first().text();
            item.description = article.find('.xwco').html();

            ctx.cache.set(item.link, JSON.stringify(item));
            return Promise.resolve(item);
        })
    );

    ctx.state.data = {
        title: baseTitle + ':' + map[category],
        link: link,
        item: items.filter((x) => x),
    };
};
