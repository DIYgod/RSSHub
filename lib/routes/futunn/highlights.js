const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const link = `https://news.futunn.com/main`;

    const response = await got.get(link);
    const $ = cheerio.load(response.data);

    const contents = $('script:not([src]):contains("window._params")');
    const params = contents.html().trim().slice(17, -1);

    const newslist = JSON.parse(params).preList;

    const out = await Promise.all(
        newslist.filter((info) => {
            if ((new URL(info.url)).host !== 'news.futunn.com') {
                return false;
            } else if (info.url.split('?')[0].includes('video')) {
                return false;
            }
            return true;
        }).map(async (info) => {
            const title = info.title;
            const itemUrl = info.url;

            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const response = await got({
                url: itemUrl,
                method: 'get',
                headers: {
                    Referer: link,
                },
            });

            const $ = cheerio.load(response.data);

            const description = $('div.newsDetailBox div.main div.inner').html();

            const date = $('div.timeBar').children().remove().end().text().trim();

            const single = {
                title,
                link: itemUrl,
                description: description,
                pubDate: timezone(parseDate(date, 'YYYY/MM/DD HH:mm'), +8)
            };
            ctx.cache.set(itemUrl, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: `富途牛牛要闻`,
        link: link,
        item: out,
    };
};
