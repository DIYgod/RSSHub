const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const baseUrl = 'https://neunews.neu.edu.cn';

module.exports = async (ctx) => {
    const type = ctx.params.type;
    const newsUrl = `${baseUrl}/${type}/list.htm`;
    const response = await got(newsUrl);

    const data = response.data;
    const $ = cheerio.load(data);

    const items = $('.column-news-list > .news_list > .news')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('a').attr('title'),
                link: new URL(item.find('a').attr('href'), baseUrl).href,
                pubDate: parseDate(item.find('.news_meta').text(), 'YYYY-MM-DD'),
            };
        });

    const results = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const result = await got(item.link);
                const $ = cheerio.load(result.data);

                item.author = $('.arti-metas').text().split('更新日期')[0];
                item.description = $('.article_content').html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `东北大学新闻网-${$('head title').text()}`,
        link: newsUrl,
        item: results,
    };
};
