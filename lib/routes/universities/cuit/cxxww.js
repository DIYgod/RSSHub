const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');

const host = 'https://www.cuit.edu.cn/';

module.exports = async (ctx) => {
    const type = ctx.params.type || '1';
    const link = host + 'NewsList?id=' + type;

    const response = await got.get(link);
    const $ = cheerio.load(response.data);

    const list = $('.news1-links-ul a')
        .slice(0, 10)
        .map((i, e) => $(e).attr('href'))
        .get();

    const out = await Promise.all(
        list.map(async (itemUrl) => {
            // list item is itemUrl
            itemUrl = url.resolve(host, itemUrl);
            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return JSON.parse(cache);
            }

            const response = await got.get(itemUrl);
            const $ = cheerio.load(response.data);

            let contentUrl = $('#NewsContent').attr('src');
            contentUrl = url.resolve(host, contentUrl);
            const response_content = await got.get(contentUrl);
            const $$ = cheerio.load(response_content.data);
            const time = $('#NewsAuthor').text().indexOf('日期：') + 3;
            const name = $('#NewsAuthor').text().indexOf('作者：') + 3;

            const single = {
                title: $('.news-content-title-text').text(),
                link: itemUrl,
                author: $('#NewsAuthor')
                    .text()
                    .substring(name, name + 3),
                description: $$('body').html(),
                pubDate: new Date(
                    $('#NewsAuthor')
                        .text()
                        .substring(time, time + 10)
                        .replace('/', '-')
                        .replace('/', '-')
                ).toUTCString(),
            };
            ctx.cache.set(itemUrl, JSON.stringify(single)); //
            return single;
        })
    );

    ctx.state.data = {
        title: $('#NewsTypeName').text(),
        link,
        item: out,
    };
};
