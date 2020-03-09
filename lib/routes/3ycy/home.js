const url = require('url');
const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const root_url = 'http://www.3ycy.com';
    const response = await got({
        method: 'get',
        url: root_url,
    });

    const $ = cheerio.load(response.data);
    const list = $('div.postList div.postItem');

    const count = [];
    for (let i = 0; i < Math.min(list.length, 10); ++i) {
        count.push(i);
    }

    const items = await Promise.all(
        count.map(async (i) => {
            const item = $(list[i]);
            const title = item.find('h3 a').first();
            const link = title.attr('href');

            return await ctx.cache.tryGet('3ycy' + link, async () => {
                const date = item
                    .find('div.postSubtitle')
                    .text()
                    .trim();
                const match = /(\d+\/\d+\/\d{4}\s+\d+:\d+:\d+\s*(?:AM|PM))/i.exec(date);
                const pubDate = match && new Date(match[1] + ' GMT+8').toUTCString();

                const res = await got({ method: 'get', url: url.resolve(root_url, link) });
                const content = cheerio.load(res.data);
                const post = content('div.postBody');
                post.find('img[data-src]').each((_, ele) => {
                    ele = content(ele);
                    ele.attr('src', ele.attr('data-src'));
                    ele.attr('alt', title.text());
                    ele.attr('title', title.text());
                    ele.removeAttr('class');
                    ele.removeAttr('data-src');
                });

                return {
                    title: title.text(),
                    link: link,
                    pubDate: pubDate,
                    description: post.html(),
                };
            });
        })
    );

    ctx.state.data = {
        title: '三界异次元',
        link: root_url,
        item: items,
    };
};
