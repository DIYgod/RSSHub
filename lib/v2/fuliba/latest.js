const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const domain = ctx.query.domain ?? 'fuliba.net';
    const res = await got(`https://${domain}`, {
        headers: {},
    });
    const $ = cheerio.load(res.data);
    const title = $('head title').text().replace(/-.*/, '');
    const list = $('article');
    const count = list
        .slice(0, ctx.query.limit ? Number(ctx.query.limit) : 40)
        .toArray()
        .map((each) => {
            each = $(each);
            const floor = each.find('a').text();
            const floorUrl = each.find('header a').attr('href');
            return {
                title: `${title}:${floor}`,
                link: String(floorUrl),
                category: each.find('.meta .cat').text(),
                pubDate: each.find('.meta time').text(),
            };
        });

    const resultItems = await Promise.all(
        count.map((i) =>
            ctx.cache.tryGet(i.link, async () => {
                i.description = await fetchContent(i.link);
                return i;
            })
        )
    );

    ctx.state.data = {
        title: String(title),
        link: `https://${domain}`,
        item: resultItems,
    };
};

async function fetchContent(url) {
    // Fetch the subpageinof
    const subres = await got(url, {
        headers: {},
    });
    const subind = cheerio.load(subres.data);
    const stubS = subind('article.article-content');
    return stubS.html();
}
