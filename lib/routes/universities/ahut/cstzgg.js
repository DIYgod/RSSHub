const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const url = `http://jsjxy.ahut.edu.cn/list.jsp?urltype=tree.TreeTempUrl&wbtreeid=1887`;
    const response = await got({
        method: 'get',
        url: url,
    });
    const $ = cheerio.load(response.data);
    $('.clickstyle1022').remove();
    $('td[width = "1%"]').remove();
    $('tr[height = "1"]').remove();
    $('td[colspan="3"]').remove();
    $('.leaderfont47822').remove();
    // ## 获取列表
    const list = $('.winstyle47822 > tbody > tr').get();
    // ## 定义输出的item
    const out = await Promise.all(
        // ### 遍历列表，筛选出自己想要的内容
        list.map(async (item) => {
            const itemSingle = cheerio.load(item);
            const title = itemSingle.text().replace(/^[\s]+|[\s]+$/g, '');
            const re = /<a[^>]*href=['"]([^"]*)['"][^>]*>/g;
            let singleUrl = '';
            if (re.exec(itemSingle.html()) !== null) {
                singleUrl = RegExp.$1;
            }
            if (singleUrl.search('http') === -1) {
                singleUrl = 'http://jsjxy.ahut.edu.cn' + singleUrl;
            }
            const cache = await ctx.cache.get(singleUrl); // ### 得到全局中的缓存信息
            // ### 判断缓存是否存在，如果存在即跳过此次获取的信息
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }
            // 获取详情页面的介绍
            const detail_response = await got({
                method: 'get',
                url: singleUrl,
            });
            const $ = cheerio.load(detail_response.data);
            const detail_content = $('.contentstyle47853 > div').html();
            // ### 设置 RSS feed item
            const single = {
                title: title.replace(/(^\s*)|(\s*$)/g, ''),
                link: singleUrl,
                // author: author,
                description: detail_content,
                // pubDate: updateDate,
            };
            // // ### 设置缓存
            ctx.cache.set(singleUrl, JSON.stringify(single));
            return Promise.resolve(single);
            // }
        })
    );
    ctx.state.data = {
        title: `安徽工业大学 - 计算机学院公告`,
        link: 'http://jsjxy.ahut.edu.cn/list.jsp?urltype=tree.TreeTempUrl&wbtreeid=1887',
        description: `安徽工业大学 - 计算机学院公告`,
        item: out,
    };
};
