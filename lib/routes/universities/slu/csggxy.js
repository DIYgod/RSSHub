// 财税与公共管理学院：http://csggxy.lixin.edu.cn/
const got = require('@/utils/got');
const cheerio = require('cheerio');
const baseurl = 'http://csggxy.lixin.edu.cn/';

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: baseurl + 'info/iList.jsp?cat_id=14751',
    });
    const $ = cheerio.load(response.data);
    // ## 获取列表
    const list = $('body > div.details > div.contentright > div.rightlist > ul > li:nth-child(1) > a').get();
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
                singleUrl = `http://csggxy.lixin.edu.cn/` + singleUrl;
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
            const detail_content = $('body > div.neirong').html();
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
        title: `财税与公共管理学院-上海立信会计金融学院`,
        link: 'http://csggxy.lixin.edu.cn/info/iList.jsp?cat_id=14751',
        description: `财税与公共管理学院-上海立信会计金融学院`,
        item: out,
    };
};
