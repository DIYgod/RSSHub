const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');

module.exports = async (ctx) => {
    const host = 'http://today.hit.edu.cn';
    const category = ctx.params.category;

    const response = await got({
        method: 'get',
        url: host + '/category/' + category,
        headers: {
            Referer: host,
        },
    });

    const $ = cheerio.load(response.data);
    const category_name = $('div.banner-title').text();
    const list = $('.paragraph li')
        .slice(0, 10)
        .map((i, e) => ({
            path: $('span span a', e).attr('href'),
            title: $('span span a', e).text(),
            author: $('div a', e).attr('hreflang', 'zh-hans').text(),
        }))
        .get();

    const out = await Promise.all(
        list.map(async (item) => {
            const { path, title, author } = item;
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

            if (response.req._headers.host === 'ids.hit.edu.cn') {
                const single = {
                    pubDate: new Date(link.split('/').slice(-4, -1).join('-')).toUTCString(),
                    author,
                    link,
                    title,
                    description: '请进行统一身份认证后查看全文',
                };
                ctx.cache.set(link, JSON.stringify(single));
                return Promise.resolve(single);
            }

            const $ = cheerio.load(response.data);
            const description =
                $('.article-content').html() &&
                $('.article-content')
                    .html()
                    .replace(/src="\//g, `src="${url.resolve(host, '.')}`)
                    .replace(/href="\//g, `href="${url.resolve(host, '.')}`)
                    .trim();
            const single = {
                pubDate: new Date($('.left-attr.first').text()).toUTCString(),
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
        title: '今日哈工大-' + category_name,
        link: host + 'category/' + category,
        description: '今日哈工大-' + category_name,
        item: out,
    };
};
