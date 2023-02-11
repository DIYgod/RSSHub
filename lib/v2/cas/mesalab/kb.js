const cherrio = require('cheerio');
const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {
    const homepage = 'https://www.mesalab.cn';
    const url = `${homepage}/f/article/articleList?pageNo=1&pageSize=15&createTimeSort=DESC`;
    const response = await got(url);

    const $ = cherrio.load(response.data);
    const articles = $('.aw-item').toArray();

    const items = await Promise.all(
        articles.map((item) => {
            const a = $(item).find('a').first();
            const title = a.text().trim();
            const link = `${homepage}${a.attr('href')}`;

            return ctx.cache.tryGet(link, async () => {
                const result = await got(link);
                const $ = cherrio.load(result.data);
                return {
                    title,
                    author: $('.user_name').text(),
                    pubDate: timezone(parseDate($('.link_postdate').text().replace(/\s+/g, ' ')), 8),
                    description: $('#article_content').html() + ($('.attachment').length ? $('.attachment').html() : ''),
                    link,
                    category: $('.category .category_r span').first().text(),
                };
            });
        })
    );

    ctx.state.data = {
        title: 'MESA 知识库',
        description: '中国科学院信息工程研究所 第二研究室 处理架构组',
        link: url,
        item: items,
    };
};
