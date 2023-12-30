const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {
    const currentUrl = 'https://www.foreverblog.cn/feeds.html';

    const response = await got(currentUrl);

    const $ = cheerio.load(response.data);
    const $articles = $('article[class="post post-type-normal"]');
    const items = $articles
        .map((_, el) => {
            const $titleDiv = $(el).find('h1[class="post-title"]');
            const title = $titleDiv.text().trim();
            const link = $titleDiv.find('a').eq(0).attr('href');
            const author = $(el).find('div[class="post-author"]').text().trim();
            const postDate = $(el).find('time').text().trim();
            const pubDate = timezone(parseDate(postDate, 'MM-DD'), +8);
            const description = `${author}: ${title}`;
            return {
                title: description,
                description,
                link,
                pubDate,
            };
        })
        .toArray();

    ctx.state.data = {
        title: '十年之约——专题展示',
        link: currentUrl,
        item: items,
    };
};
