const got = require('@/utils/got');
const cheerio = require('cheerio');
const utils = require('./utils');

module.exports = async (ctx) => {
    const url = 'https://www.nytimes.com/svc/collections/v1/publish/https://www.nytimes.com/zh-hans/series/daily-briefing-chinese/rss.xml';
    const response = await got({
        method: 'get',
        url,
    });
    const data = response.data;
    const $ = cheerio.load(data);
    const post = $('item')
        .map((index, elem) => {
            const title = $(elem).find('title').text();
            const link = $(elem).find('link').next().text();
            return {
                link: link,
                title: title,
            };
        })
        .get();

    const browser = await require('@/utils/puppeteer')();

    const items = await Promise.all(
        post.map(async (item) => {
            // use puppeter cause all the image is lazy-load
            const result = utils.ProcessFeed(await utils.PuppeterGetter(ctx, browser, item.link), true);

            item.pubDate = result.pubDate;

            // Match 感谢|謝.*?cn.letters@nytimes.com。
            const ending = /&#x611F;(&#x8C22|&#x8B1D);.*?cn\.letters@nytimes\.com&#x3002;/g;

            const matching = '<div class="article-paragraph">';
            const formatted = '<br>' + matching;

            item.description = result.description.replace(ending, '').split(matching).join(formatted);

            return Promise.resolve(item);
        })
    );

    browser.close();

    ctx.state.data = {
        title: '纽约时报中文网|每日简报',
        link: url,
        item: items,
    };
};
