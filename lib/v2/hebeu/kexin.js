// 引入所需库
const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

// 创建一个category到title的映射
const map = {
    tpxw: '图片新闻',
    tzgg: '文化建设',
    xyxw: '通知公告',
    xsyd: '创新创业',
    zxdt: '学院新闻',
};

module.exports = async (ctx) => {
    const category = ctx.params.category || 'tpxw';
    const rootUrl = 'https://kexin.hebeu.edu.cn/index';
    const currentUrl = `${rootUrl}/${category}.htm`;

    // 获取页面html
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);
    const list = $('table.winstyle192692 tr').slice(0, 10);

    // 解析文章列表
    const items = await Promise.all(
        list.map(async (index, item) => {
            item = $(item);
            const a = item.find('td a');
            // 检查a标签是否有href属性
            if (!a.attr('href')) {
                return;
            }
            const link = new URL(a.attr('href'), currentUrl).href;

            // 使用ctx.cache.tryGet缓存
            const cache = await ctx.cache.tryGet(link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: link,
                });
                const content = cheerio.load(detailResponse.data);
                const date = parseDate(content('span.timestyle125310').text(), 'YYYY-MM-DD HH:mm');

                return {
                    title: content('td.titlestyle125310').text(),
                    description: content('td.contentstyle125310').html(),
                    pubDate: timezone(date, +8), // 使用timezone函数处理时区
                    link,
                };
            });

            return cache;
        })
    );

    // 删除没有数据的元素
    const validItems = items.filter((item) => item !== undefined);

    ctx.state.data = {
        title: `河北工程大学科信学院 - ${map[category]}`,
        link: currentUrl,
        item: validItems,
    };
};
