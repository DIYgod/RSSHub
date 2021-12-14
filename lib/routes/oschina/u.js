const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const res = await got({
        method: 'get',
        url: `https://my.oschina.net/u/${id}`,
        headers: {
            Referer: `https://my.oschina.net/u/${id}`,
        },
    });
    const $ = cheerio.load(res.data);
    $('div[data-tooltip]').remove();
    const author = $('[data-user-name]').attr('data-user-name');
    const list = $('#newestBlogList').find('.blog-item');
    const count = [];
    for (let i = 0; i < Math.min(list.length, 10); i++) {
        count.push(i);
    }
    const resultItem = await Promise.all(
        count.map(async (i) => {
            const each = $(list[i]);
            const originalUrl = each.find('a.header', '.content').attr('href');
            const item = {
                title: each.find('a.header', '.content').text(),
                description: each.find('p', '.description').text(),
                link: encodeURI(originalUrl),
            };
            const key = 'oschina' + item.link;
            const value = await ctx.cache.get(key);

            if (value) {
                item.description = value;
            } else {
                const detail = await got({
                    method: 'get',
                    url: item.link,
                    headers: {
                        Referer: item.link,
                    },
                });
                const content = cheerio.load(detail.data);
                content('#articleContent .ad-wrap').remove();
                item.description = content('.article-detail').html();
                ctx.cache.set(key, item.description);
            }
            return item;
        })
    );

    ctx.state.data = {
        title: author + '的博客',
        link: `https://my.oschina.net/u/${id}`,
        item: resultItem,
    };
};
