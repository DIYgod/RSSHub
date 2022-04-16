const got = require('@/utils/got');
const cheerio = require('cheerio');
const { art } = require('@/utils/render');
const path = require('path');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const response = await got.get('http://www.chinacef.cn/index.php/index/index');

    const data = response.data;

    const $ = cheerio.load(data);

    const domArray = $('#boardright ul');
    const siteLink = 'http://www.chinacef.cn';
    const rssTitle = '金融热点 - 首席经济学家论坛';

    const itemArray = await Promise.all(
        domArray
            .map(async (index, item) => {
                item = $(item);
                const itemLink = siteLink + item.find('li a').attr('href');
                const detail = await ctx.cache.tryGet(itemLink, async () => {
                    const result = await got.get(itemLink);
                    const $ = cheerio.load(result.data);
                    const description = art(path.join(__dirname, 'templates/work_description.art'), {
                        desc: $('.newsmaintext').first().html().trim(),
                    });
                    return {
                        title: $('.contenttitle').first().html().trim(),
                        author: $('.zzinfo').find('h2').first().text().trim(),
                        pubDate: parseDate($('.divwidth').text().trim().split(' ')[3], 'YYYY-MM-DD'),
                        article: description,
                    };
                });

                return {
                    title: detail.title,
                    description: detail.article,
                    link: itemLink,
                    pubDate: detail.pubDate,
                    author: detail.author,
                };
            })
            .get()
    );

    ctx.state.data = {
        title: rssTitle,
        link: siteLink,
        item: itemArray,
    };
};
