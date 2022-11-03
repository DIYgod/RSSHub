const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const host = 'https://hitgs.hit.edu.cn';

    const response = await got(host + '/tzgg/list.htm', {
        headers: {
            Referer: host,
        },
    });

    const $ = cheerio.load(response.data);
    const list = $('.news_list li')
        .map((i, e) => ({
            pubDate: parseDate($('span:nth-child(4)', e).text()),
            title: $('span.Article_BelongCreateOrg.newsfb', e).text() + $('span a', e).attr('title'),
            category: $('span.Article_BelongCreateOrg.newsfb', e).text().slice(1, -1),
            link: host + $('span a', e).attr('href'),
        }))
        .get();

    const out = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const response = await got(item.link, {
                    headers: {
                        Referer: host,
                    },
                });
                const $ = cheerio.load(response.data);
                item.description = $('.wp_articlecontent').html();
                item.author = $('div.infobox > div > p > span:nth-child(3)').text().slice(3);
                return item;
            })
        )
    );

    ctx.state.data = {
        title: '哈工大研究生院通知公告',
        link: host + '/tzgg/list.htm',
        description: '哈尔滨工业大学研究生院通知公告',
        item: out,
    };
};
