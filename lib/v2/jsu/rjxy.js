// 导入必要的模组
const got = require('@/utils/got'); // 自订的 got
const cheerio = require('cheerio'); // 可以使用类似 jQuery 的 API HTML 解析器
const { parseDate } = require('@/utils/parse-date');
const { getPageItemAndDate } = require('@/v2/jsu/utils');

module.exports = async (ctx) => {
    const baseUrl = 'https://rjxy.jsu.edu.cn/';

    const response = await got({
        method: 'get',
        url: 'https://rjxy.jsu.edu.cn/index/tzgg1.htm',
    });

    const $ = cheerio.load(response.data);
    const list = $('body > div.list-box > div > ul > li').toArray();
    const out = await Promise.all(
        list.map((item) => {
            item = $(item);
            const link = new URL(item.find('a').attr('href'), baseUrl).href;
            return ctx.cache.tryGet(link, async () => {
                const category = '通知公告';
                const description = await getPageItemAndDate('#vsb_content', link, 'body > form > div > h1', 'body > form > div > div.label', (date) => date.split('  点击：')[0]);
                const pubDate = parseDate(description.date, 'YYYY年MM月DD日 HH:mm');
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
        title: '吉首大学计算机科学与工程学院 - 通知公告',
        link: 'https://rjxy.jsu.edu.cn/index/tzgg1.htm',
        description: '吉首大学计算机科学与工程学院 - 通知公告',
        item: out,
    };
};
