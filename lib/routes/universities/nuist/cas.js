const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');

const baseTitle = 'NUIST AS（南信大大气科学学院）';
const baseUrl = 'http://cas.nuist.edu.cn';
const map = {
    12: '信息公告',
    11: '新闻快讯',
    3: '科学研究',
    110: '网上公示',
    4: '本科教育',
    5: '研究生教育',
};

module.exports = async (ctx) => {
    const category = map.hasOwnProperty(ctx.params.category) ? ctx.params.category : 12;
    const link = baseUrl + '/Show.aspx?CI=' + category;

    const response = await got.get(link);
    const $ = cheerio.load(response.data);
    const list = $('#ctl00_ctl00_body_NewsList')
        .find('tr.gridline')
        .slice(0, 6)
        .map((index, item) => {
            const td = $(item).find('td.gridline').slice(0, 10);
            return {
                title: $(item).find('.Title').text().trim(),
                link: url.resolve(baseUrl, $(item).find('.Title').attr('href')),
                category: td.eq(1).text().trim(),
                pubDate: new Date(td.eq(2).text().replace('[', '').replace(']', '')).toUTCString(),
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
            const article = $('#ctl00_ctl00_body_lmnr');

            item.author = article.find('.zzxx').text().split(' ')[0].trimRight().replace('作者:', '');
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
