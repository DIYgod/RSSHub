const got = require('@/utils/got');
const cheerio = require('cheerio');

const baseUrl = 'http://neunews.neu.edu.cn';
module.exports = async (ctx) => {
    const type = ctx.params.type;
    const newsUrl = `${baseUrl}/${type}/list.htm`;
    const response = await got({
        method: 'get',
        url: newsUrl,
    });

    const data = response.data;
    const $ = cheerio.load(data);

    const title = $('title').text();
    const items = $('.column-news-list > .news_list > .news > .news_title')
        .slice(0, 10)
        .children();
    const results = [];
    items.each(async (index, item) => {
        const label = $(item);
        const title = $(label).attr('title');
        const url = baseUrl + $(label).attr('href');
        const description = await ctx.cache.tryGet(url, async () => {
            const result = await got.get(url);
            const $ = cheerio.load(result.data);
            // 处理部分格式
            $('article')
                .find('span')
                .each(function() {
                    const temp = $(this).text();
                    $(this).replaceWith(temp);
                });
            $('article')
                .find('div')
                .each(function() {
                    const temp = $(this).html();
                    $(this).replaceWith(temp);
                });
            $('article')
                .find('a')
                .remove();
            $('article')
                .find('p')
                .each(function() {
                    $(this).removeAttr('style');
                    $(this).removeAttr('class');
                });
            return $('article').html();
        });
        const result = {
            title: title,
            description: description,
            link: url,
        };
        results.push(result);
    });
    ctx.state.data = {
        title: title,
        item: results,
    };
};
