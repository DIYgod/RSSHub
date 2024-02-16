const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const rootUrl = 'https://www.gamer520.com';

module.exports = async (ctx) => {
    const response = await got(rootUrl);
    const $ = cheerio.load(response.data);
    const list = $('body > div.site > div.site-content > div > main > div > div > div > div > div > main > div.row.posts-wrapper > div')
        .map((_, item) => ({
            title: $(item).find('div.entry-wrapper > header > h2 > a').text(),
            link: new URL($(item).find('div.entry-wrapper > header > h2 > a').attr('href'), rootUrl).href,
            pubDate: parseDate($(item).find('div.entry-wrapper > div > ul > li.meta-date > time').attr('datetime')),
            description: '',
            category: $(item).find('div.entry-wrapper > header > div > span > a').text(),
        }))
        .get();
    /*
        // 站长留言说：“不要扒我了”，所以这里注释掉了
        const items = await Promise.all(
            list.map((item) =>
                ctx.cache.tryGet(item.link, async () => {
                    const detailResponse = await got(item.link);
                    const content = cheerio.load(detailResponse.data);
                    item.description = content('div.entry-content.u-text-format.u-clearfix').text();
                    // 休息0.5秒，防止被封
                    await new Promise((resolve) => setTimeout(resolve, 500));

                    return item;
                })
            )
        );
*/
    ctx.state.data = {
        title: 'Gamer520 - 最近更新',
        link: rootUrl,
        item: list,
    };
};
