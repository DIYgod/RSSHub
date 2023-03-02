const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');
const config = require('@/config').value;

module.exports = async (ctx) => {
    const rootUrl = 'https://www.nationalgeographic.com';
    const apiUrl = `${rootUrl}/photo-of-the-day`;
    const response = await ctx.cache.tryGet(apiUrl, async () => (await got(apiUrl)).data, config.cache.contentExpire, false);
    const $ = cheerio.load(response);

    const natgeo = JSON.parse($.html().match(/window\['__natgeo__'\]=(.*);/)[1]);
    const media = natgeo.page.content.mediaspotlight.frms[0].mods[0].edgs[1].media;

    const items = media.map((item) => ({
        title: item.meta.title,
        description: art(path.join(__dirname, 'templates/dailyPhoto.art'), {
            img: item.img,
        }),
        link: rootUrl + item.locator,
        pubDate: parseDate(item.caption.preHeading),
        author: item.img.crdt,
    }));

    ctx.state.data = {
        title: 'Nat Geo Photo of the Day',
        link: apiUrl,
        item: items,
    };
};
