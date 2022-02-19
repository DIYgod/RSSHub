const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const link = `https://zhiyou.smzdm.com/member/${ctx.params.uid}/baoliao/`;

    const response = await got.get(link);
    const $ = cheerio.load(response.data);
    const title = $('.info-stuff-nickname').text();

    const list = $('.pandect-content-stuff')
        .slice(0, 20)
        .map(function () {
            const info = {
                title: $(this).find('.pandect-content-title a').text(),
                link: $(this).find('.pandect-content-title a').attr('href'),
                pubdate: $(this).find('.pandect-content-time').text(),
            };
            return info;
        })
        .get();

    const out = await Promise.all(
        list.map(async (info) => {
            const title = info.title;
            const pubdate = info.pubdate;
            const itemUrl = info.link;

            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const response = await got.get(itemUrl);
            const $ = cheerio.load(response.data);
            const content = $('article.txt-detail');
            const description = content.html();

            const single = {
                title,
                link: itemUrl,
                description,
                pubDate: new Date(pubdate),
            };
            ctx.cache.set(itemUrl, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: `${title}的爆料 - 什么值得买`,
        link,
        item: out,
    };
};
