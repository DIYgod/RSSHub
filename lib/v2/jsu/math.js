// 导入必要的模组
const got = require('@/utils/got'); // 自订的 got
const cheerio = require('cheerio'); // 可以使用类似 jQuery 的 API HTML 解析器
const { parseDate } = require('@/utils/parse-date');
const { getPageItem } = require('@/v2/jsu/utils');

module.exports = async (ctx) => {
    const baseUrl = 'https://stxy.jsu.edu.cn/';

    const response = await got({
        method: 'get',
        url: 'https://stxy.jsu.edu.cn/index/tzgg1.htm',
    });

    const $ = cheerio.load(response.data);
    const list = $('#right_con > div.articleList > ul > div').toArray().slice(0, 10);
    const out = await Promise.all(
        list.map(async (item) => {
            item = $(item);
            const link = item.find('div.art_title > a').attr('href').replace('../', baseUrl);
            const title = item.find('div.art_title > a').text() || '无标题';
            const date = item.find('div.art_author > span').text();
            const category = '';
            const pubDate = parseDate(date, 'YYYY年MM月DD日');
            const description = await getPageItem(ctx, '#right_con > form > div.articleInfo', link);
            return {
                title,
                link,
                pubDate,
                description,
                category,
            };
        })
    );

    ctx.state.data = {
        // 在此处输出您的 RSS
        title: '吉首大学数学与统计学院 - 通知公告',
        link: baseUrl,
        description: '吉首大学数学与统计学院 - 通知公告',
        item: out,
    };
};
