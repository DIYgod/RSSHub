const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {
    const baseUrl = 'http://rsks.hunanpea.com';
    const { guid } = ctx.params;
    const link = `${baseUrl}/Category/${guid}/ArticlesByCategory.do?PageIndex=1`;
    const { data: response } = await got(link);

    const $ = cheerio.load(response);
    const list = $('#column_content > ul > li')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('a').attr('title'),
                link: `${baseUrl}${item.find('a').attr('href').replace('ArticleDetail.do', 'InternalArticleDetail.do?')}`,
                pubDate: timezone(parseDate(item.find('em').text()), +8),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = cheerio.load(response);

                item.description = $('.content_area').html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `${$('.sitemap h2').text()} - ${$('head title').text()}`,
        link,
        item: items,
    };
};
