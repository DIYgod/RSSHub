const got = require('@/utils/got');
const cheerio = require('cheerio');
const config = require('@/config').value;
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

const baseUrl = 'https://www.tiktok.com';

module.exports = async (ctx) => {
    const { user } = ctx.params;

    const html = await ctx.cache.tryGet(
        `tiktok:user:${user}`,
        async () => {
            const browser = await require('@/utils/puppeteer')();
            const page = await browser.newPage();
            await page.goto(`${baseUrl}/${user}`, {
                waitUntil: 'networkidle2',
            });
            const html = await page.evaluate(() => document.documentElement.innerHTML);
            browser.close();
            return html;
        },
        config.cache.routeExpire,
        false
    );

    const $ = cheerio.load(html);

    let items = $('[class*=-DivItemContainerV2]')
        .toArray()
        .map((item) => ({ link: $(item).find('[class*=-DivWrapper] a').attr('href') }));

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const videoId = item.link.substring(item.link.lastIndexOf('/') + 1);
                const api = (
                    await got(`${baseUrl}/node/share/video/${user}/${videoId}`, {
                        headers: {
                            referer: `${baseUrl}/${user}`,
                        },
                    })
                ).data;

                item.title = api.itemInfo.itemStruct.desc;
                item.description = art(path.join(__dirname, 'templates/user.art'), {
                    poster: api.itemInfo.itemStruct.video.cover,
                    source: api.itemInfo.itemStruct.video.playAddr,
                });
                item.author = api.itemInfo.itemStruct.author.nickname;
                item.pubDate = parseDate(api.itemInfo.itemStruct.createTime * 1000);

                return item;
            })
        )
    );

    ctx.state.data = {
        title: $('title').text(),
        description: $('[data-e2e=user-bio]').text(),
        link: `${baseUrl}/${user}`,
        item: items,
    };
};
