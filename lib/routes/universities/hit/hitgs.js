const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');

module.exports = async (ctx) => {
    const host = 'http://hitgs.hit.edu.cn';

    const response = await got({
        method: 'get',
        url: host + '/tzgg/list.htm',
        headers: {
            Referer: host,
        },
    });

    const $ = cheerio.load(response.data);
    const list = $('.news_list li')
        .map((i, e) => ({
            path: $('span a', e).attr('href'),
            pubDate: new Date($('span:nth-child(4)', e).text()).toUTCString(),
            title: $('span.Article_BelongCreateOrg.newsfb', e).text() + $('span a', e).attr('title'),
            author: $('span.Article_BelongCreateOrg.newsfb', e).text(),
        }))
        .get();

    const out = await Promise.all(
        list.map(async (item) => {
            const { path, pubDate, title, author } = item;
            const link = host + path;

            const cache = await ctx.cache.get(link);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const response = await got({
                method: 'get',
                url: link,
                headers: {
                    Referer: host,
                },
            });

            const $ = cheerio.load(response.data);
            const description =
                $('.wp_articlecontent').html()
            const single = {
                pubDate,
                author,
                link,
                title,
                description,
            };

            ctx.cache.set(link, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: '哈工大研究生院通知公告',
        link: host + '/tzgg/list.htm',
        description: '哈尔滨工业大学研究生院通知公告',
        item: out,
    };
};
