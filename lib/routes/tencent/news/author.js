const got = require('@/utils/got');
const cheerio = require('cheerio');
const date = require('@/utils/date');
const iconv = require('iconv-lite');

module.exports = async (ctx) => {
    const mid = ctx.params.mid;
    const link = `https://new.qq.com/omn/author/${mid}`;
    const api_url = `https://pacaio.match.qq.com/om/mediaArticles?mid=${mid}&num=15&page=0`;
    const response = await got({
        method: 'get',
        url: api_url,
        headers: { Referer: link },
    });
    const reponse = response.data;
    const title = reponse.mediainfo.name;
    const description = reponse.mediainfo.intro;
    const list = reponse.data.splice(0, 10);

    const items = await Promise.all(
        list.map(async (item) => {
            const title = item.title;
            const unixTimestamp = new Date(item.timestamp * 1000);
            const pubDate = date(unixTimestamp.toLocaleString(), 8);
            const itemUrl = item.vurl;
            const author = item.source;
            const abstract = item.abstract;

            const response = await ctx.cache.tryGet(
                itemUrl,
                async () =>
                    (
                        await got.get(itemUrl, {
                            responseType: 'buffer',
                        })
                    ).data
            );
            const html = iconv.decode(response, 'gbk');
            const $ = cheerio.load(html, { decodeEntities: false });
            const article = $('div.content-article');

            const single = {
                title,
                description: article.html() || abstract,
                link: itemUrl,
                author,
                pubDate,
            };
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title,
        description,
        link,
        item: items,
    };
};
