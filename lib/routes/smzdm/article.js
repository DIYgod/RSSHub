const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {
    const link = `https://zhiyou.smzdm.com/member/${ctx.params.uid}/article/`;

    const response = await got.get(link);
    const $ = cheerio.load(response.data);
    const title = $('.info-stuff-nickname').text();

    const list = $('.pandect-content-stuff')
        .slice(0, 10)
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
            const content = $('.m-contant article');
            const description = content.html();

            const single = {
                title: title,
                link: itemUrl,
                description: description,
                pubDate: timezone(parseDate(pubdate, 'MM-DD H:mm'), +8),
            };
            ctx.cache.set(itemUrl, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: `${title}-什么值得买`,
        link: link,
        item: out,
    };
};
