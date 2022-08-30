const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const category = ctx.params.category;
    const currentUrl = `https://news.cts.com.tw/${category}/index.html`;
    const response = await got(currentUrl);
    const $ = cheerio.load(response.data);
    const items = await Promise.all(
        $('#newslist-top a[title]')
            .slice(0, ctx.query.limit ? parseInt(ctx.query.limit) : 20)
            .get()
            .map((item) => {
                item = $(item);
                const link = item.attr('href');

                return ctx.cache.tryGet(link, async () => {
                    const response = await got(link);
                    const $ = cheerio.load(response.data);
                    const thumb = item.find('.newsimg-thumb img');

                    return {
                        title: item.attr('title'),
                        author: $('.artical-content p:eq(0)').text().trim(),
                        description: art(path.join(__dirname, 'templates/description.art'), {
                            description: $('.artical-content p:gt(0)').text().trim(),
                            image: $('.artical-img img').attr('src') || thumb.attr('data-src') || thumb.attr('src'),
                        }),
                        category: $('meta[property="article:section"]').attr('content'),
                        pubDate: parseDate($('meta[property="article:published_time"]').attr('content')),
                        link,
                    };
                });
            })
    );

    ctx.state.data = {
        title: $('title').text(),
        link: currentUrl,
        description: $('meta[name="description"]').attr('content'),
        item: items,
    };
};
