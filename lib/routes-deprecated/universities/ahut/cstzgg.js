const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');

module.exports = async (ctx) => {
    const response = await got.get('http://jsjxy.ahut.edu.cn/index/tzgg.htm');
    const $ = cheerio.load(response.data);

    // 获取列表
    const list = $('a.c259382')
        .map((index, ele) => ({
            title: $(ele).attr('title'),
            link: url.resolve('http://jsjxy.ahut.edu.cn/', $(ele).attr('href')),
        }))
        .get();

    // 定义输出的item
    const out = await Promise.all(
        // 遍历列表，筛选出自己想要的内容
        list.map(async (item) => {
            const cache = await ctx.cache.get(item.link); // 得到全局中的缓存信息
            // 判断缓存是否存在，如果存在即跳过此次获取的信息
            if (cache) {
                return JSON.parse(cache);
            }
            // 获取详情页面的介绍
            const detail_response = await got.get(item.link);
            const $ = cheerio.load(detail_response.data);

            // 设置 RSS feed item
            item.description = $('.contentstyle47853 > div').html();
            item.pubDate = new Date($('.timestyle47853').text().trim());

            // 设置缓存
            ctx.cache.set(item.link, JSON.stringify(item));
            return item;
        })
    );
    ctx.state.data = {
        title: `安徽工业大学 - 计算机学院公告`,
        link: 'http://jsjxy.ahut.edu.cn/list.jsp?urltype=tree.TreeTempUrl&wbtreeid=1887',
        description: `安徽工业大学 - 计算机学院公告`,
        item: out,
    };
};
