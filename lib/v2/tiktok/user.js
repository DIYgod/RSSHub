const config = require('@/config').value;
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

const baseUrl = 'https://www.tiktok.com';

module.exports = async (ctx) => {
    const { user } = ctx.params;

    const data = await ctx.cache.tryGet(
        `tiktok:user:${user}`,
        async () => {
            const browser = await require('@/utils/puppeteer')();
            const page = await browser.newPage();
            await page.setRequestInterception(true);
            page.on('request', (request) => {
                request.resourceType() === 'document' || request.resourceType() === 'script' ? request.continue() : request.abort();
            });
            await page.goto(`${baseUrl}/${user}`, {
                waitUntil: 'networkidle0',
            });
            const SIGI_STATE = await page.evaluate(() => window.SIGI_STATE);
            browser.close();

            const lang = SIGI_STATE.AppContext.lang;
            const SharingMeta = SIGI_STATE.SharingMeta;
            const ItemModule = SIGI_STATE.ItemModule;

            return { lang, SharingMeta, ItemModule };
        },
        config.cache.routeExpire,
        false
    );

    const items = Object.values(data.ItemModule).map((item) => ({
        title: item.desc,
        description: art(path.join(__dirname, 'templates/user.art'), {
            poster: item.video.cover,
            source: item.video.playAddr,
        }),
        author: item.nickname,
        pubDate: parseDate(item.createTime, 'X'),
        link: `${baseUrl}/@${item.author}/video/${item.id}`,
        category: item.textExtra.map((t) => `#${t.hashtagName}`),
    }));

    ctx.state.data = {
        title: data.SharingMeta.value['og:title'],
        description: data.SharingMeta.value['og:description'],
        image: data.SharingMeta.value['og:image'],
        link: `${baseUrl}/${user}`,
        item: items,
        language: data.lang,
    };
};
