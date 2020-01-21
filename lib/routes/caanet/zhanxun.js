// ## 照顾老弱病残
require('tls').DEFAULT_MIN_VERSION = 'TLSv1'
const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const url = `https://www.caanet.org.cn/news.mx?id=3`;
    const response = await got({
        method: 'get',
        url: url,
    });
    const $ = cheerio.load(response.data);
	// ## 获取列表
    const list = $('.news_lines > ul > li > a').get();
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
				
            singleUrl = 'https://www.caanet.org.cn/' + singleUrl;
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
            const detail_content = $('.page_r').html();
			// ### 获取时间
			const timeblock = $('p.laiyuan').text().replace(/\//g,"-").match(/发布时间：(\S*) /);
			const time = new Date(timeblock[1]).toUTCString();
            // ### 设置 RSS feed item
            const single = {
                title: title,
                link: singleUrl,
                // author: author,
                description: detail_content,
                pubDate: time,
            };
            // // ### 设置缓存
            ctx.cache.set(singleUrl, JSON.stringify(single));
            return Promise.resolve(single);
            // }
        })
    );

    ctx.state.data = {
        title: `公告通知 - 中国美术家协会`,
        link: 'https://www.caanet.org.cn/news.mx?id=3',
        description: `公告通知 - 中国美术家协会`,
        item: out,
    };
};
