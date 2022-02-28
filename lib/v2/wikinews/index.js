const got = require('@/utils/got');
const { parseString } = require('xml2js');
const cheerio = require('cheerio');
const currentURL = 'https://zh.wikinews.org/wiki/Special:%E6%96%B0%E9%97%BB%E8%AE%A2%E9%98%85';
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const resp = await got(currentURL);
    const {
        urlset: { url: urls },
    } = await new Promise((resolve, reject) => {
        parseString(resp.data, (err, result) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(result);
        });
    });

    ctx.state.data = {
        title: '最新新闻 - 维基新闻',
        link: currentURL,
        item: await Promise.all(
            urls.map(async (url) => {
                const loc = url.loc[0];
                const news = url['news:news'][0];
                const description = await ctx.cache.tryGet(loc, async () => {
                    const resp = await got(loc);
                    const $ = cheerio.load(resp.data);
                    return $('#bodyContent').html();
                });
                return {
                    title: news['news:title'][0],
                    pubDate: parseDate(news['news:publication_date'][0]),
                    category: news['news:keywords'][0].split(',').map((item) => item.trim()),
                    link: loc,
                    description,
                };
            })
        ),
    };
};
