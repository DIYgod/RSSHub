const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');
const iconv = require('iconv-lite');

const host = 'http://opinion.people.com.cn';

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const link = `http://opinion.people.com.cn/GB/${id}/index.html`;
    const response = await got.get(link, {
        responseType: 'buffer',
    });
    response.data = iconv.decode(response.data, 'gbk');

    const $ = cheerio.load(response.data);

    let title = $('div.path.w1000_320.clearfix.red').text();
    title = title.replace(/ >> /g, '—');

    const list = $('ul.list_14.clearfix li')
        .slice(0, 10)
        .map(function () {
            const info = {
                title: $(this).find('a').text(),
                link: $(this).find('a').attr('href'),
                date: $(this).find('i').text(),
            };
            return info;
        })
        .get();

    const out = await Promise.all(
        list.map(async (info) => {
            const title = info.title;
            const date = info.date;
            const itemUrl = url.resolve(host, info.link);

            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const response = await got.get(itemUrl, {
                responseType: 'buffer',
            });
            response.data = iconv.decode(response.data, 'gbk');

            const $ = cheerio.load(response.data);
            const description = $('div.fl.text_con_left').html().trim();

            const single = {
                title: title,
                link: itemUrl,
                description: description,
                pubDate: new Date(date).toUTCString(),
            };
            ctx.cache.set(itemUrl, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: title,
        link: link,
        item: out,
    };
};
