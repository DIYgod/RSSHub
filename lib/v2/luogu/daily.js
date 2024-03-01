const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const id = ctx.params.id ?? 47327;
    const link = `https://www.luogu.com.cn/discuss/${id}`;
    const response = await got(link);
    const $ = cheerio.load(response.data);
    const title = $('head title').text();

    const injectionScript = $('head script:contains("window._feInjection")').text();
    const jsonRaw = injectionScript.match(/window\._feInjection = JSON\.parse\(decodeURIComponent\("(.*?)"\)\);/)[1];
    const jsonDecode = JSON.parse(decodeURIComponent(jsonRaw));

    const mdRaw = jsonDecode.currentData.post.content;

    const dailyLink = mdRaw.match(/<([^>]*)>/)[1];
    const { data: dailyResponse } = await got(dailyLink);
    const $daily = cheerio.load(dailyResponse);
    const issueHeading = $daily('.am-article-title').first().text().trim();
    const item = [
        {
            title,
            description: $daily('#article-content').html(),
            link,
            author: jsonDecode.currentData.post.author.name,
            guid: `${link}#${issueHeading}`,
            pubDate: parseDate(jsonDecode.currentData.post.time),
        },
    ];

    ctx.state.data = {
        title: '洛谷日报',
        link,
        item,
    };
};
