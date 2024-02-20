// 导入必要的模组
const got = require('@/utils/got'); // 自订的 got
const cheerio = require('cheerio'); // 可以使用类似 jQuery 的 API HTML 解析器
const { parseDate } = require('@/utils/parse-date');
const { getPageItem } = require('@/v2/jsu/utils');

module.exports = async (ctx) => {
    const baseUrl = 'https://www.jsu.edu.cn/';

    const response = await got({
        method: 'get',
        url: 'https://www.jsu.edu.cn/index/tzgg.htm',
    });

    const $ = cheerio.load(response.data);
    const list = $('body > div.container.container-fluid.dynava.no-padding.cleafix > div.con_wz_fr.fr.cleafix > div:nth-child(2) > ul > li').toArray();
    const out = await Promise.all(
        list.map(async (item) => {
            item = $(item);
            const link = item.find('a').attr('href').replace('../', baseUrl);
            const title = item.find('a').text() || '无标题';
            const date = item.find('span').text();
            const category = '';
            const pubDate = parseDate(date, 'YYYY-MM-DD');
            const description = await getPageItem(ctx, '#vsb_content', link);
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
        title: '吉首大学 - 通知公告',
        link: baseUrl,
        description: '吉首大学 - 通知公告',
        item: out,
    };
};
