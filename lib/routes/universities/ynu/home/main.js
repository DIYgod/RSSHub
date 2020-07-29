const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');

// 云南大学主页通知公告
module.exports = async (ctx) => {
    const host = 'http://www.ynu.edu.cn/';

    const response = await got({
        method: 'get',
        url: 'http://www.ynu.edu.cn/tzgg.htm',
        headers: {
            Referer: host,
        },
    });

    const $ = cheerio.load(response.data);
    const list = $('.list_cont_rigB.fl ul li')
        .slice(0, 8)
        .map((i, e) => ({
            path: $('a', e).attr('href'),
            title: $('a', e).attr('title'),
            author: '云南大学',
        }))
        .get();
    const out = await Promise.all(
        list.map(async (item) => {
            const { path, title, author } = item;
            const link = path.indexOf('http://') === -1 ? host + path : path;
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
                $('.v_news_content').html() &&
                $('.v_news_content')
                    .html()
                    .replace(/src="\//g, `src="${url.resolve(host, '.')}`)
                    .replace(/href="\//g, `href="${url.resolve(host, '.')}`)
                    .trim();

            const single = {
                pubDate: new Date($('.dateAadDian').text().slice(6, 17).replace(/年/, '-').replace(/月/, '-').replace(/日/, '')).toUTCString(),
                author: author,
                link: link,
                title: title,
                description: description,
            };
            ctx.cache.set(link, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: '云南大学主页通知公告',
        link: host,
        description: '云南大学主页通知公告',
        item: out,
    };
};
