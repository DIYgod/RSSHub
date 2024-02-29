const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    let host = 'https://www.ifanr.com';

    let channel;
    if (ctx.params.channel) {
        channel = ctx.params.channel.toLowerCase();
        channel = channel.split('-').join('/');

        // 兼容旧版路由
        host = channel === 'appso' ? `${host}/app` : `${host}/${channel}`;
    } else {
        host = `${host}/app`;
        channel = 'app';
    }

    const response = await got.get(host);

    const $ = cheerio.load(response.data);

    let list;
    switch (channel) {
        case 'dasheng':
            list = $('#articles-collection')
                .find('.c-bricks__brick a.c-dasheng')
                .map((i, e) => $(e).attr('href'))
                .get();
            break;
        default:
            list = $('#articles-collection')
                .find('.article-item .article-info h3 a')
                .map((i, e) => $(e).attr('href'))
                .get();
            break;
    }

    const out = await Promise.all(
        list.map(async (itemUrl) => {
            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return JSON.parse(cache);
            }

            const response = await got.get(itemUrl);
            const $ = cheerio.load(response.data);

            const item = {
                title: $('.c-single-normal__title').text(),
                link: itemUrl,
                author: $('.c-card-author__name').text(),
                description: $('article').html(),
                pubDate: new Date($('.c-article-header-meta__time').attr('data-timestamp') * 1000),
            };
            // "大声" 标题
            if (/^https?:\/\/www\.ifanr\.com\/dasheng\/.*$/.test(itemUrl)) {
                item.title = $('.c-dasheng_header__title').text();
            }

            ctx.cache.set(itemUrl, JSON.stringify(item));
            return item;
        })
    );

    ctx.state.data = {
        title: `iFanr - ${$('h1.c-archive-header__title').text()}：${$('div.c-archive-header__desc').text()}`,
        link: host,
        item: out,
    };
};
