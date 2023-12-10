const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {
    const categoryId = ctx.params.cat;
    const link = `https://www.niaogebiji.com/cat/${categoryId}`;

    const response = await got(link);
    const $ = cheerio.load(response.data);
    const catName = $('h1').text();

    const articles = $('div.articleBox.clearfix')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('.articleTitle').text().trim(),
                description: item.find('.articleContentInner').text().trim(),
                author: item.find('.author').text().trim(),
                link: new URL(item.find('a').first().attr('href'), link).href,
                category: [
                    ...item
                        .find('.art_tag')
                        .toArray()
                        .map((tag) => $(tag).text().trim()),
                    catName,
                ],
            };
        });

    const items = await Promise.all(
        articles.map((element) =>
            ctx.cache.tryGet(element.link, async () => {
                const response = await got(element.link);
                const $ = cheerio.load(response.data);

                element.pubDate = timezone(parseDate($('.writeTime3').text().trim()), 8);
                element.description = $('.pc_content').html();

                return element;
            })
        )
    );

    ctx.state.data = {
        title: $('head title').text(),
        description: $('head meta[name="description"]').attr('content'),
        link,
        item: items,
    };
};
