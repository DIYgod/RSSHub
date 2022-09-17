const cherrio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx, next) => {
    const homepage = 'https://www.mesalab.cn';
    const response = await got({
        method: 'get',
        url: `${homepage}/f/article/articleList?pageNo=1&pageSize=15&createTimeSort=DESC`,
    });

    const $ = cherrio.load(response.data);
    const articles = $('.aw-item').get();

    const items = await Promise.all(
        articles.map((item) => {
            const article = $(item).find('.aw-item-content > p').first();
            const title = article
                .text()
                .replace(/(\r\n|\n|\r)/gm, ' ')
                .trim();
            const link = `${homepage}/${article.find('a').attr('href')}`;

            return ctx.cache.tryGet(link, async () => {
                const result = await got.get(link);
                const $ = cherrio.load(result.body);
                return {
                    title,
                    author: $('.user_name').text(),
                    pubDate: new Date($('.link_postdate').text().replace(/\s+/g, ' ')).toUTCString(),
                    description: $('#article_details').html(),
                    link,
                };
            });
        })
    );

    ctx.state.data = {
        title: 'MESA 知识库',
        description: '中国科学院信息工程研究所 第二研究室 处理架构组',
        link: homepage,
        item: items,
    };

    await next();
};
