const asyncPool = require('tiny-async-pool');
const cheerio = require('cheerio');
const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const UA = require('@/utils/rand-user-agent')({ browser: 'chrome', os: 'android', device: 'mobile' });

const parseArticle = (item, ctx) =>
    ctx.cache.tryGet(item.link, async () => {
        const url = `${item.link}amp`;
        const response = await got({
            url,
            method: 'get',
            headers: {
                'User-Agent': UA,
            },
        });
        const html = response.data;
        const $ = cheerio.load(html);
        const content = $('main#main-content[data-category="story page"]');
        // remove share button
        content.find('div[class*="ArticleShare"]').remove();
        return {
            title: item.title,
            pubDate: parseDate(item.pubDate),
            link: item.link,
            description: content.html(),
        };
    });

const asyncPoolAll = async (...args) => {
    const results = [];
    for await (const result of asyncPool(...args)) {
        results.push(result);
    }
    return results;
};
module.exports = {
    asyncPoolAll,
    parseArticle,
};
