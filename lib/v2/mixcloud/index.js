const cheerio = require('cheerio');
const { parseRelativeDate } = require('@/utils/parse-date');

const host = 'https://www.mixcloud.com';

module.exports = async (ctx) => {
    const type = ctx.params.type ?? 'uploads';
    if (!['stream', 'uploads', 'favorites', 'listens'].includes(type)) {
        throw Error(`Invalid type: ${type}`);
    }

    const link = `${host}/${ctx.params.username}/${type}/`;
    const browser = await require('@/utils/puppeteer')();
    const page = await browser.newPage();
    await page.goto(link);

    const html = await page.evaluate(() => document.documentElement.innerHTML);

    const $ = cheerio.load(html);
    const username = $('div.profile-username > h1').text();
    const description = $('div.profile-bio > div > div').html();
    const image = $('div.avatar > img').attr('src');
    const list = $('div.profile-new-design > div.content > div > div > div > div > div')
        .slice(0, 10)
        .map((_, item) => {
            item = $(item);
            const a = item
                .find('a')
                .filter((_, a) => {
                    a = $(a);
                    return $(a).text().trim().length > 0;
                })
                .first();
            return {
                title: a.text(),
                link: new URL(a.attr('href'), host).href,
            };
        })
        .get();

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailPage = await browser.newPage();
                await detailPage.goto(item.link);
                const detailHtml = await detailPage.evaluate(() => document.documentElement.innerHTML);
                const $ = cheerio.load(detailHtml);
                item.description = $('div.show-description > div').html();
                item.itunes_image = $('div.album-art > img').attr('src');
                item.itunes_duration = $('span.total-time').text();
                item.pubDate = parseRelativeDate($('ul.show-stats > li:nth-child(2)').text());
                return item;
            })
        )
    );

    browser.close();

    ctx.state.data = {
        title: `Mixcloud - ${username}'s ${type}`,
        link,
        description,
        itunes_author: username,
        image,
        item: items,
    };
};
