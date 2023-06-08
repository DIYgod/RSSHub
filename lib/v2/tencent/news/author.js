const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {
    const mid = ctx.params.mid;
    const response = await got(`https://pacaio.match.qq.com/om/mediaArticles?mid=${mid}&num=10&page=0`);
    const reponse = response.data;
    const title = reponse.mediainfo.name;
    const description = reponse.mediainfo.intro;
    const list = reponse.data;

    const items = await Promise.all(
        list.map((item) => {
            const title = item.title;
            const pubDate = timezone(parseDate(item.time), +8);
            const itemUrl = item.vurl;
            const author = item.source;
            const abstract = item.abstract;

            return ctx.cache.tryGet(itemUrl, async () => {
                const response = await got(itemUrl);
                const $ = cheerio.load(response.data);
                const article = $('div.content-article');

                return {
                    title,
                    description: article.html() || abstract,
                    link: itemUrl,
                    author,
                    pubDate,
                };
            });
        })
    );

    ctx.state.data = {
        title,
        description,
        link: `https://new.qq.com/omn/author/${mid}`,
        item: items,
    };
};
