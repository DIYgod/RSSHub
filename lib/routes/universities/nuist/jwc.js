const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');

const baseTitle = '南信大本科教学信息网';
const baseUrl = 'http://jwc.nuist.edu.cn';
const map = {
    1: '通知公告',
    2: '教学新闻',
    4: '规章制度',
    5: '教学研究',
    6: '教务管理',
    7: '考试中心',
    8: '教材建设',
    9: '实践教学',
    56: '三百工程',
    60: '创新创业',
    62: '规章制度',
    43: '业务办理',
};

module.exports = async (ctx) => {
    const category = map.hasOwnProperty(ctx.params.category) ? ctx.params.category : 1;
    const link = baseUrl + '/Show.aspx?CI=' + category;

    const response = await got.get(link);
    const $ = cheerio.load(response.data);
    const list = $('#ctl00_ctl00_mainbody_rightbody_NewsList')
        .find('.gridline')
        .slice(0, 6)
        .map((index, item) => {
            const td = $(item).find('td');
            return {
                title: td.eq(0).text(),
                link: url.resolve(baseUrl, td.eq(0).find('a').attr('href')),
                pubDate: new Date(td.eq(2).text()).toUTCString(),
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
            const article = $('#ctl00_ctl00_mainbody_rightbody_lmnr');

            item.author = article.find('.zzxx').text().split(' ')[0].trimRight();
            item.description = article.find('.xwco').html();
            item.category = map[category];

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
