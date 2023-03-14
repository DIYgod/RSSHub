const cheerio = require('cheerio');
const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const UA = require('@/utils/rand-user-agent')({ browser: 'chrome', os: 'android', device: 'mobile' });

const getArticleDetails = async (items, ctx) => {
    const list = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const url = item.link;
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
            })
        )
    );
    return list;
};

module.exports = {
    getArticleDetails,
};
