// 导入必要的模组
const got = require('@/utils/got'); // 自订的 got
const cheerio = require('cheerio'); // 可以使用类似 jQuery 的 API HTML 解析器
const { parseDate } = require('@/utils/parse-date');
const { getPageItemAndDate } = require('@/v2/jsu/utils');

module.exports = async (ctx) => {
    const baseUrl = 'https://jwc.jsu.edu.cn/';
    const { types = 'jwtz' } = ctx.params;
    const selectors = {
        jwtz: {
            list: 'body > div.w1180.isect1.clearfix > div.isect1_1 > div > div.textNews > table > tbody > tr',
            title: 'td.titleborderstyle135034 > a',
            category: '教务通知',
        },
        jwdt: {
            list: 'body > div.w1180.isect1.clearfix > div.isect1_2 > table > tbody > tr',
            title: 'td.titleborderstyle135032 > a',
            category: '教务动态',
        },
    };
    const response = await got({
        method: 'get',
        url: 'https://jwc.jsu.edu.cn/index.htm',
    });

    const $ = cheerio.load(response.data);
    const list = $(selectors[types].list).toArray();
    const out = await Promise.all(
        list.map((item) => {
            item = $(item);
            const link = baseUrl + item.find(selectors[types].title).attr('href');
            return ctx.cache.tryGet(link, async () => {
                const description = await getPageItemAndDate(
                    '#vsb_content',
                    link,
                    'body > div.w1180.nyWrap.clearfix > div.nyRight > div > div.passage.contPsg > form > div > h1',
                    'body > div.w1180.nyWrap.clearfix > div.nyRight > div > div.passage.contPsg > form > div > div:nth-child(2)',
                    (date) => date.split('     文章来源：')[0].split('添加时间：')[1]
                );
                const category = selectors[types].category;
                const pubDate = parseDate(description.date, 'YYYY年MM月DD日');
                return {
                    title: description.title,
                    link,
                    pubDate,
                    description: description.pageInfo,
                    category,
                };
            });
        })
    );

    ctx.state.data = {
        // 在此处输出您的 RSS
        title: `吉首大学教务处 - ${selectors[types].category}`,
        link: baseUrl,
        description: `吉首大学教务处 - ${selectors[types].category}`,
        item: out,
    };
};
