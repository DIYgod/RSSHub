const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');

const host = 'http://jhsjk.people.cn';

module.exports = async (ctx) => {
    let keyword = ctx.params.keyword || 'all';
    let year = ctx.params.year || 0;

    let title = '习近平系列重要讲话';
    title = title + '-' + keyword;
    if (keyword === 'all') {
        keyword = '';
    }
    if (year !== 0) {
        title = title + '-' + year;
        year = year - 1811;
    } else {
        title = title + '-all';
    }

    const link = `http://jhsjk.people.cn/result?keywords=${keyword}&year=${year}`;
    const response = await got.get(link);

    const $ = cheerio.load(response.data);

    const list = $('ul.list_14.p1_2.clearfix li')
        .slice(0, 10)
        .map(function () {
            const info = {
                title: $(this).find('a').text(),
                link: $(this).find('a').attr('href'),
            };
            return info;
        })
        .get();

    const out = await Promise.all(
        list.map(async (info) => {
            const title = info.title;
            const itemUrl = url.resolve(host, info.link);

            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const response = await got.get(itemUrl);
            const $ = cheerio.load(response.data);
            const description = $('div.d2txt_con.clearfix').html().trim();

            const single = {
                title: title,
                link: itemUrl,
                description: description,
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
