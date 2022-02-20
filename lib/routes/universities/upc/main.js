// 学校官网：http://www.upc.edu.cn/
const got = require('@/utils/got');
const cheerio = require('cheerio');
const baseurl = 'http://news.upc.edu.cn/';
// 地址映射
const MAP = {
    notice: 'tzgg',
    scholar: 'xsdt',
};
// 头部信息
const HEAD = {
    notice: '通知公告',
    scholar: '学术动态',
};

module.exports = async (ctx) => {
    const type = ctx.params.type;
    const response = await got({
        method: 'get',
        url: baseurl + MAP[type] + '.htm',
    });
    const $ = cheerio.load(response.data);
    // ## 获取列表
    const list = $('div.container > div.main-ny > div.main-ny-cont > div.main-ny-cont-box > div.main-list-box > div.main-list-box-left > ul > li > div.li-right > div.li-right-bt > a').get();
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
                singleUrl = `http://news.upc.edu.cn/` + singleUrl;
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
            const detail_content = $('div.container > div.main-ny > div.main-ny-cont > div.main-ny-cont-box > div.main-content-box > form').html();
            // ### 设置 RSS feed item
            const single = {
                title,
                link: singleUrl,
                // author,
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
        title: HEAD[type] + `-中国石油大学（华东）`,
        link: baseurl + MAP[type] + '.htm',
        description: HEAD[type] + `-中国石油大学（华东）`,
        item: out,
    };
};
