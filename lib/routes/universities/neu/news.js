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
        .get();
    const results = await Promise.all(
        items.map(async (item) => {
            const $ = cheerio.load(item);
            const title = $('a').attr('title');
            const url = baseUrl + $('a').attr('href');
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
            Promise.resolve(result);
        })
    );
    ctx.state.data = {
        title: `东北大学新闻网-${title}`,
        item: results,
    };
};
