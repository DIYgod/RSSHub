// 导入必要的模组
const got = require('@/utils/got'); // 自订的 got
const cheerio = require('cheerio'); // 可以使用类似 jQuery 的 API HTML 解析器
const { parseDate } = require('@/utils/parse-date');
const { getPageItemAndDate } = require('./utils');

module.exports = async (ctx) => {
    const baseUrl = 'https://www.jsu.edu.cn/';

    const response = await got({
        method: 'get',
        url: 'https://www.jsu.edu.cn/index/tzgg.htm',
    });

    const $ = cheerio.load(response.data);
    const list = $('body > div.container.container-fluid.dynava.no-padding.cleafix > div.con_wz_fr.fr.cleafix > div:nth-child(2) > ul > li').toArray();
    const out = await Promise.all(
        list.map((item) => {
            item = $(item);
            const link = new URL(item.find('a').attr('href'), baseUrl).href;
            return ctx.cache.tryGet(link, async () => {
                const description = await getPageItemAndDate(
                    '#vsb_content',
                    link,
                    'body > div.container.container-fluid.dynava.no-padding.cleafix > div.con_wz_fr.fr.cleafix > form > div > h1',
                    'body > div.container.container-fluid.dynava.no-padding.cleafix > div.con_wz_fr.fr.cleafix > form > div > div:nth-child(2)',
                    (date) => date.split('时间：')[1].split(' 作者：')[0]
                );
                const pubDate = parseDate(description.date, 'YYYY-MM-DD');
                return {
                    title: description.title,
                    link,
                    pubDate,
                    description: description.pageInfo,
                    category: '通知公告',
                };
            });
        })
    );

    ctx.state.data = {
        // 在此处输出您的 RSS
        title: '吉首大学 - 通知公告',
        link: 'https://www.jsu.edu.cn/index/tzgg.htm',
        description: '吉首大学 - 通知公告',
        item: out,
    };
};
