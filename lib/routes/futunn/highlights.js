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
        newslist
            .filter((info) => {
                const url = new URL(info.url);
                if (url.hostname !== 'news.futunn.com') {
                    // ignore videos.futunn.com
                    return false;
                } else if (url.searchParams.get('src') !== '3') {
                    // ignore src=12 redirecting to mp.weixin.qq.com
                    return false;
                }
                return true;
            })
            .map(async (info) => {
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
                    description,
                    pubDate: timezone(parseDate(date, 'YYYY/MM/DD HH:mm'), +8),
                };
                ctx.cache.set(itemUrl, JSON.stringify(single));
                return Promise.resolve(single);
            })
    );

    ctx.state.data = {
        title: `富途牛牛要闻`,
        link,
        item: out,
    };
};
