const got = require('@/utils/got');
const cheerio = require('cheerio');
const config = require('@/config').value;
const { art } = require('@/utils/render');
const { join } = require('path');

module.exports = async (ctx) => {
    const baseUrl = 'https://winstall.app';
    const { appId } = ctx.params;

    const buildId = await ctx.cache.tryGet(
        'winget:buildId',
        async () => {
            const { data } = await got(baseUrl);
            const $ = cheerio.load(data);

            return JSON.parse($('#__NEXT_DATA__').text()).buildId;
        },
        config.cache.routeExpire,
        false
    );

    const { data: response } = await got(`${baseUrl}/_next/data/${buildId}/apps/${appId}.json`);
    const { app } = response.pageProps;
    const items = app.versions.map((item) => ({
        title: `${app.name} ${item.version}`,
        description: art(join(__dirname, 'templates/desc.art'), {
            installers: item.installers,
        }),
        author: app.publisher,
        category: app.tags,
        guid: `winstall:${appId}:${item.version}`,
    }));

    ctx.state.data = {
        title: `${app.name} - winstall`,
        description: app.desc,
        link: `${baseUrl}/apps/${appId}`,
        image: `https://api.winstall.app/icons/next/${appId}.webp`,
        language: 'en',
        item: items,
    };
};
