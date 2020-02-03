const got = require('@/utils/got');
const cheerio = require('cheerio');
const logger = require('@/utils/logger');

module.exports = async (ctx) => {
    const domain = 'http://wap.eastday.com';

    const response = await got({
        method: 'post',
        url: `https://apin.eastday.com/api/news/list`,
        json: {
            channelId: '15',
            currentPage: 1,
            pageSize: 20,
            appId: '190504',
            deviceId: '00000000',
            version: '0.0.0.2',
        },
    });

    const result = await Promise.all(
        response.data.list.map(async (item) => {
            const link = item.url;
            const entity = {
                title: item.title,
                description: item.abstracts + '...',
                pubDate: new Date(item.time).toUTCString(),
                link,
            };

            try {
                const cacheKey = `eastday_sh_${link}`;
                // 判断缓存中是否存在
                const cacheValue = await ctx.cache.get(cacheKey);
                if (cacheValue) {
                    entity.description = cacheValue;
                } else {
                    const article = await got({
                        method: 'get',
                        url: link,
                    });
                    // 解析html内容
                    const $ = cheerio.load(article.body);
                    const content = $('.article_wrapper .mainLayer .content').html() || $('.contentBox .article .detail').html();
                    // 存放到缓存区
                    ctx.cache.set(cacheKey, content);
                    entity.description = content;
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
