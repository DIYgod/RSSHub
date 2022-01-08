const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const baseURL = 'https://jxjy.ecust.edu.cn/';

module.exports = async (ctx) => {
    const url = baseURL + 'yeDaZhuanLan.aspx?pk=153';
    const response = await got({
        method: 'get',
        url,
    });

    const data = response.data;

    const $ = cheerio.load(data);

    const list = $('#main .enro_content>dl');

    const items = await Promise.all(
        list.map(async (i, item) => {
            item = $(item);
            const link = baseURL + item.find('a').attr('href');
            const description = await ctx.cache.tryGet(link, async () => {
                const result = await got.get(link);

                const $ = cheerio.load(result.data);

                return $('#articlepanel').html();
            });
            return {
                title: item.find('a').text().trim(),
                pubDate: timezone(parseDate(item.find('dd').text().trim(), 'YYYY/MM/DD'), +8),
                link,
                description,
            };
        })
    );

    ctx.state.data = {
        title: '华东理工继续教育学院',
        description: '新闻公告',
        link: baseURL,
        item: items,
    };
};
