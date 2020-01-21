// ## 照顾老弱病残
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0
const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');
const iconv = require('iconv-lite');

module.exports = async (ctx) => {
	const response = await got.get('https://yjszs.ecnu.edu.cn/system/bszsxx_list.asp', {
                responseType: 'buffer',
            });
	response.data = iconv.decode(response.body, 'gbk');
	const $ = cheerio.load(response.data);
    // ## 获取列表
    const list = $('.col-md-12 > .lightgreybox > ul >li').get();
    // ## 定义输出的item
    const out = await Promise.all(
        // ### 遍历列表，筛选出自己想要的内容
        list.map(async (item) => {
            const itemSingle = cheerio.load(item);
            const title = itemSingle.text();
            const re=/<a\s+[^>]*href=['"]([^'"]*?)['"]\s[^>]*>/g;
            let singleUrl = '';
            if (re.exec(itemSingle.html()) !== null) {
                singleUrl = RegExp.$1;
            }
			if (singleUrl.indexOf("http") == -1) {
                singleUrl = RegExp.$1;
				singleUrl = 'https://yjszs.ecnu.edu.cn/system/' + singleUrl;
            }
			singleTitle = title.replace(/\s/g,"");
			// ### 获取时间并格式化
			const timeblock = singleTitle.slice(-8);
			const yy = timeblock.substr(0, 4);
			const mm = timeblock.substr(4, 2);
			const dd = timeblock.substr(6, 2);
			const ymd = yy + "-" + mm + "-" + dd;
			const time = new Date(ymd).toUTCString();
			
            const cache = await ctx.cache.get(singleUrl); // ### 得到全局中的缓存信息
            // ### 判断缓存是否存在，如果存在即跳过此次获取的信息
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }
            // 获取详情页面的介绍
			const detail_response = await got.get(singleUrl, {
                responseType: 'buffer',
            });
			detail_response.data = iconv.decode(detail_response.body, 'gbk');
			const $ = cheerio.load(detail_response.data);
            const detail_content = $('.row').html();
			if (detail_content == null) {
				const detail_content = title;
			}
			let detail = '';
			detail = detail_content.replace(/[\t\n]/g,"").trim().replace(/\s/g,"");
			let retitle = '';
			retitle = title.replace(/[\t\n]/g,"").replace(/\s/g,"");
            // ### 设置 RSS feed item
            const single = {
                title: retitle,
                link: singleUrl,
                // author: author,
                description: detail,
                pubDate: time,
            };
            // // ### 设置缓存
            ctx.cache.set(singleUrl, JSON.stringify(single));
            return Promise.resolve(single);
            // }
        })
    );

    ctx.state.data = {
        title: `博士招生 - 华东师范大学`,
        link: 'https://yjszs.ecnu.edu.cn/system/bszsxx_list.asp',
        description: `博士招生 - 华东师范大学`,
        item: out,
    };
};
