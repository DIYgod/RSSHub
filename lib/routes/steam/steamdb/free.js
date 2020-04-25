const cloudscraper = require('cloudscraper');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const { type } = ctx.params;
    const url = 'https://steamdb.info/upcoming/free';
    const html = await cloudscraper.get(url);
    const $ = cheerio.load(html);

    const $trs = $('.container table.table-products:first-of-type tbody tr');
    const getItems = $trs
        .toArray()
        .reverse()
        .map(async (el) => {
            const $el = $(el);
            const $tds = $el.children('td');

            // link & logo - 0
            const linkEl = $($tds.get(0)).find('a').get(0);
            const link = (linkEl && linkEl.attribs.href) || '';

            // appid
            const found = /app\/(\d+)/.exec(link);
            const appid = found ? found[1] : '';

            // title - 1
            const title = $($tds.get(1)).text().trim();

            // promotion type - 3
            const promoType = $($tds.get(3)).text().trim();

            // startDate - 4
            const startDate = $tds.get(4).attribs.title;

            // endDate - 5
            // const endDate = $tds.get(5).attribs.title;

            // ignore items without appid or not matched the type
            if (!appid || (type && type.toLowerCase() !== promoType.toLocaleLowerCase())) {
                return null;
            }

            const hoverLink = `https://steamdb.info/api/RenderAppHover/?appid=${appid}`;
            const description = await ctx.cache.tryGet(hoverLink, async () => {
                const description = await cloudscraper.get(hoverLink);
                return description;
            });

            return {
                title: `[${promoType}] ${title}`,
                link,
                pubDate: new Date(startDate).toUTCString(),
                description,
            };
        });

    const item = await Promise.all(getItems);

    ctx.state.data = {
        title: 'Steam 免费游戏 [SteamDB]',
        link: url,
        item: item.filter((itm) => !!itm),
        allowEmpty: true,
    };
};
