const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');

module.exports = async (ctx) => {
    const response = await got.get('http://news.ahut.edu.cn/list.jsp?urltype=tree.TreeTempUrl&wbtreeid=1002');
    const $ = cheerio.load(response.data);

    // 获取列表
    const list = $('.winstyle247968 a.c247968')
        .map((index, ele) => ({
            title: $(ele).attr('title'),
            link: url.resolve('http://news.ahut.edu.cn/', $(ele).attr('href')),
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
            item.description = $('.winstyle1023').html();
            item.pubDate = new Date($('.timestyle1023').text().trim());

            // 设置缓存
            ctx.cache.set(item.link, JSON.stringify(item));
            return item;
        })
    );
    ctx.state.data = {
        title: `安徽工业大学 - 学校要闻`,
        link: 'http://news.ahut.edu.cn/list.jsp?urltype=tree.TreeTempUrl&wbtreeid=1002',
        description: `安徽工业大学 - 学校要闻`,
        item: out,
    };
};
