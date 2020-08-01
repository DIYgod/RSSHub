const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const url = `http://jwc.usst.edu.cn`;
    const response = await got({
        method: 'get',
        url: url,
    });
    const $ = cheerio.load(response.data);
    $('td[width="30px"]').remove();
    $('td[width="195"]').remove();
    // ## 获取列表
    const list = $('#container-2 > .inner .post1 > .con > ul > li ').get();
    // ## 定义输出的item
    const out = await Promise.all(
        // ### 遍历列表，筛选出自己想要的内容
        list.map(async (item) => {
            const itemSingle = cheerio.load(item);
            const title = itemSingle.text();
            const re = /<a[^>]*href=['"]([^"]*)['"][^>]*>(.*?)<\/a>/g;
            let singleUrl = '';
            if (re.exec(itemSingle.html()) !== null) {
                singleUrl = RegExp.$1;
            }
            if (singleUrl.search('http') === -1) {
                singleUrl = `http://jwc.usst.edu.cn/` + singleUrl;
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
            const detail_content = $('.wp_articlecontent').html();
            // ### 设置 RSS feed item
            const single = {
                title: title,
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
        title: `上海理工大学 - 教务处`,
        link: 'http://jwc.usst.edu.cn/',
        description: `上海理工大学 - 教务处`,
        item: out,
    };
};
