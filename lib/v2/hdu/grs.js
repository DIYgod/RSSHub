const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const categoryTitleMap = {
        1764: '通知公告',
        1721: '招生信息',
        1722: '招生简章',
        1726: '培养信息',
        1727: '培养工作规章制度',
        1728: '培养方案',
        1729: '学位信息',
        1730: '学位工作规章制度',
        1731: '学位工作国家文件',
        1732: '在职硕士招生信息',
        1733: '在职硕士招生简章',
        1734: '在职硕士规章制度',
        1735: '在职硕士课程进修',
        1736: '学生工作工作信息',
        1737: '学生工作规章制度',
        1738: '学生工作学科竞赛',
        1739: '就业信息',
        1740: '就业工作政策法规',
        1741: '就业工作档案查询',
        xgxz: '相关下载',
    };

    const category = ctx.params.category;
    const rootUrl = `https://grs.hdu.edu.cn/${category}/list.htm`;

    const response = await got({
        method: 'get',
        url: rootUrl,
    });

    const $ = cheerio.load(response.data);
    const list = $('fieldset[style="width:720"] div#wp_news_w11 tbody tr').get();

    const items = await Promise.all(
        list.map(async (item) => {
            const $1 = $(item);
            const $a = $1.find('td a');
            const title = $a.attr('title');
            const link = $a.attr('href');
            const pubDate = parseDate($1.find('td[width="80"]').text(), 'YYYY-MM-DD');

            if (!title || !link) {
                return null;
            }

            const href = new URL(link, rootUrl).href;

            const cache = await ctx.cache.tryGet(href, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: href,
                });
                const content = cheerio.load(detailResponse.data);

                return {
                    title,
                    link: href,
                    description: content('div.wp_articlecontent').html(),
                    pubDate,
                };
            });

            return cache;
        })
    ).then((items) => items.filter((item) => item !== null));

    ctx.state.data = {
        title: `杭州电子科技大学研究生院 - ${categoryTitleMap[category]}`,
        link: rootUrl,
        item: items,
    };
};
