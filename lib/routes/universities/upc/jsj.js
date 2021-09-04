// 计算机科学与技术学院：http://computer.upc.edu.cn/
// - 学院新闻：http://computer.upc.edu.cn/6277/list.htm
// - 学术关注：http://computer.upc.edu.cn/6278/list.htm
// - 学工动态：http://computer.upc.edu.cn/6279/list.htm
// - 通知公告：http://computer.upc.edu.cn/6280/list.htm

const got = require('@/utils/got');
const cheerio = require('cheerio');
const baseurl = 'http://computer.upc.edu.cn/';
// 地址映射
const MAP = {
    news: '6277',
    scholar: '6278',
    states: '6279',
    notice: '6280',
};
// 头部信息
const HEAD = {
    news: '学院新闻',
    scholar: '学术关注',
    states: '学工动态',
    notice: '通知公告',
};

module.exports = async (ctx) => {
    const type = ctx.params.type;
    const response = await got({
        method: 'get',
        url: baseurl + MAP[type] + '/list.htm',
    });
    const $ = cheerio.load(response.data);
    // ## 获取列表
    const list = $('#wp_news_w15 > table > tbody > tr > td > table > tbody > tr > td > a').get();
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
                singleUrl = baseurl + singleUrl;
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
            const detail_content = $('div.contain > div.main > div.right_cont > article').html();
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
        title: HEAD[type] + `-计算机科学与技术学院`,
        link: baseurl + MAP[type] + '.htm',
        description: HEAD[type] + `-计算机科学与技术学院`,
        item: out,
    };
};
