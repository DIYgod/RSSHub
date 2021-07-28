const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');

const host = 'https://bbs.hupu.com';

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const order = ctx.params.order || 1;

    let link = `https://bbs.hupu.com/${id}`;

    let order_name;
    if (parseInt(order) === 1) {
        order_name = '最新回帖';
    } else if (parseInt(order) === 2) {
        order_name = '最新发帖';
        link += '-postdate-1';
    } else if (parseInt(order) === 3) {
        order_name = '精华';
        link += '-digest';
    }

    const response = await got.get(link);
    const $ = cheerio.load(response.data);

    const type_name = $('span.infoname').text();
    const description = $('#des_forum').text();

    const list = $('ul.for-list li')
        .slice(0, 10)
        .map(function () {
            const info = {
                title: $(this).find('div.titlelink.box > a.truetit').text().trim(),
                link: $(this).find('div.titlelink.box > a.truetit').attr('href'),
                author: $(this).find('a.aulink').text(),
            };
            return info;
        })
        .get();

    for (let i = list.length - 1; i >= 0; i--) {
        if (!list[i].link.endsWith('html')) {
            list.splice(i, 1);
        }
    }

    const out = await Promise.all(
        list.map(async (info) => {
            const title = info.title;
            const itemUrl = url.resolve(host, info.link);
            const author = info.author;

            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const response = await got.get(itemUrl);
            const $ = cheerio.load(response.data);

            const date = $('#tpc span.stime').text();
            const description = $('div.quote-content').html();

            const single = {
                title: title,
                link: itemUrl,
                author: author,
                description: description,
                pubDate: new Date(date).toUTCString(),
            };
            ctx.cache.set(itemUrl, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: `${type_name}${order_name}——虎扑步行街`,
        link: link,
        description: description,
        item: out,
    };
};
