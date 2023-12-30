const got = require('@/utils/got');
const cheerio = require('cheerio');
const logger = require('@/utils/logger');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {
    const domain = 'http://wap.eastday.com';

    const response = await got({
        method: 'get',
        url: `https://apin.eastday.com/apiplus/special/specialnewslistbyurl?specialUrl=1632798465040016&skipCount=0&limitCount=20`,
    });

    const result = await Promise.all(
        response.data.data.list.map(async (item) => {
            const link = item.url;
            const entity = {
                title: item.title,
                description: item.abstracts,
                pubDate: timezone(parseDate(item.time), +8),
                link,
            };

            try {
                const cacheKey = `eastday_sh_${link}`;
                entity.description = await ctx.cache.tryGet(cacheKey, async () => {
                    const article = await got({
                        method: 'get',
                        url: link,
                    });
                    // 解析html内容
                    const $ = cheerio.load(article.body);
                    return $('.article_wrapper .mainLayer .content').html() || $('.contentBox .article .detail').html();
                });
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
