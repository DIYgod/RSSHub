const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
// const logger = require('@/utils/logger');

module.exports = async (ctx) => {
    const user = ctx.params.user;
    const link = `https://codeforces.com/comments/with/${user}`;

    const rsp = await got.get(link);
    const $ = cheerio.load(rsp.data);

    const items = $('table.comment-table')
        .slice(0, 10)
        .map((_, item) => {
            item = $(item);
            const pubDate = parseDate(item.find('span.format-humantime').attr('title'));
            const a = item.find('a:nth-of-type(2)');
            const description = item.find('div.ttypography').text();
            const blog = a.text();
            const link = a.attr('href');
            return {
                title: `${user} commented on ${blog}`,
                // the article content
                description,
                // the article publish time
                pubDate,
                // the article link
                link: `https://codeforces${link}`,
            };
        })
        .get();

    ctx.state.data = {
        title: `Codeforces - Comments from ${user}`,
        link,
        item: items,
    };
};
