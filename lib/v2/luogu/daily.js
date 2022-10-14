const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const id = ctx.params.id ?? 47327;
    const link = `https://www.luogu.com.cn/discuss/${id}`;
    const response = await got(link);
    const $ = cheerio.load(response.data);
    const title = $('head title').text();

    const firstPost = $('.am-comment-main .am-comment-bd').first();
    const dailyLink = firstPost.find('a').first().attr('href');
    const issueHeading = firstPost.find('h1').text().trim();
    const { data: dailyResponse } = await got(dailyLink);
    const $daily = cheerio.load(dailyResponse);
    const item = [
        {
            title,
            description: $daily('#article-content').html(),
            link,
            author: firstPost.find('p').eq(1).text(),
            guid: `${link}#${issueHeading}`,
            pubDate: parseDate(issueHeading.match(/(\d{4} 年 \d{2} 月 \d{2} 日)/)[1], 'YYYY 年 MM 月 DD 日'),
        },
    ];

    ctx.state.data = {
        title: '洛谷日报',
        link,
        item,
    };
};
