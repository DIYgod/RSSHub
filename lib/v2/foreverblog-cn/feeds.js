const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const currentUrl = `https://www.foreverblog.cn/feeds.html`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);
    const $articles = $('article[class="post post-type-normal"]');
    const items = $articles
        .map((_, el) => {
            const $titleDiv = $(el).find('h1[class="post-title"]');
            const title = $titleDiv.text().trim();
            const link = $titleDiv.find('a').eq(0).attr('href');
            const author = $(el).find('div[class="post-author"]').text().trim();
            const postDate = $(el).find('time').text().trim();
            const description = `${postDate} ${author}: ${title}`;
            return {
                title: description,
                description,
                link,
            };
        })
        .toArray();

    ctx.state.data = {
        title: `十年之约——专题展示`,
        link: currentUrl,
        item: items,
    };
};
