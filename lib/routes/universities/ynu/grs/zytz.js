const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');

// 云南大学研究生院重要通知
module.exports = async (ctx) => {
    const host = 'http://www.grs.ynu.edu.cn/';

    const response = await got({
        method: 'get',
        url: 'http://www.grs.ynu.edu.cn/index.htm',
        headers: {
            Referer: host,
        },
    });

    const $ = cheerio.load(response.data);
    const list = $('#news table table tbody tr')
        .slice(0, 9)
        .map((i, e) => ({
            path: $('td a', e).attr('href'),
            title: $('td a', e).attr('title'),
            author: '研究生院',
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
                pubDate: new Date($('#times').text().slice(5)).toUTCString(),
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
        title: '云南大学研究生院重要通知',
        link: host + 'zytz.htm',
        description: '云南大学研究生院重要通知',
        item: out,
    };
};
