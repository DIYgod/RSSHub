const got = require('@/utils/got');
const cheerio = require('cheerio');
const logger = require('@/utils/logger');

module.exports = async (ctx) => {
    const domain = 'http://wap.eastday.com';

    const response = await got({
        method: 'get',
        url: `${domain}/node2/node3/n5/index5_t81.html`,
    });
    const data = JSON.parse(response.body.trim());

    const result = await Promise.all(
        data.newslist.map(async (item) => {
            const link = item.newsurl.match(/^http/) ? item.newsurl : domain + item.newsurl;
            const description = item.imgurl1 ? `<img src="${domain}${item.imgurl1}"><br>` : '';
            const entity = {
                title: item.newstitle,
                author: item.source,
                description,
                pubDate: new Date(item.createTime).toUTCString(),
                link,
            };

            try {
                const cacheKey = `eastday_sh_${item.newsurl}`;
                const xmlLink = domain + item.newsurl.split('_')[0] + '_K77.xml';
                // 判断缓存中是否存在
                const cacheValue = await ctx.cache.get(cacheKey);
                if (cacheValue) {
                    entity.description += cacheValue;
                } else {
                    const article = await got({
                        method: 'get',
                        url: xmlLink,
                    });
                    // 解析html内容
                    const $ = cheerio.load(article.body, { xmlMode: true });
                    const content = $('zw').text();
                    // 存放到缓存区
                    ctx.cache.set(cacheKey, content);
                    entity.description += content;
                }
            } catch (error) {
                logger.error(error);
            }

            return entity;
        })
    );

    ctx.state.data = {
        title: `东方网-上海`,
        link: `${domain}/wap/sh.html`,
        item: result,
    };
};
