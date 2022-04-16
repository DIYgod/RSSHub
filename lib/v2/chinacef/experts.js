const got = require('@/utils/got');
const cheerio = require('cheerio');
const { art } = require('@/utils/render');
const path = require('path');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const response = await got(`http://www.chinacef.cn/index.php/experts/zjmain/experts_id/${ctx.params.experts_id}`);

    const data = response.data;

    const $ = cheerio.load(data);

    const domArray = $('div[class^="leftnews"]');
    const itemAuthor = $('div[class=right515name] h3').text().trim();
    const siteLink = 'http://www.chinacef.cn';
    const rssTitle = $('title').text().trim();

    const itemArray = await Promise.all(
        domArray
            .filter((index, item) => undefined !== $(item).find('h2 > a').attr('href'))
            .map(async (index, item) => {
                item = $(item);
                const itemLink = siteLink + item.find('h2 > a').attr('href');
                const detail = await ctx.cache.tryGet(itemLink, async () => {
                    const result = await got.get(itemLink);
                    const $ = cheerio.load(result.data);
                    const description = art(path.join(__dirname, 'templates/work_description.art'), {
                        desc: $('.newsmaintext').first().html().trim(),
                    });
                    return {
                        title: $('.contenttitle').first().html().trim(),
                        article: description,
                    };
                });

                return {
                    title: detail.title,
                    description: detail.article,
                    link: itemLink,
                    pubDate: parseDate(item.find('span').first().text(), 'YYYY-MM-DD'),
                    author: itemAuthor,
                };
            })
    );

    ctx.state.data = {
        title: rssTitle,
        link: siteLink,
        item: itemArray,
    };
};
