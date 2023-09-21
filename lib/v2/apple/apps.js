const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const { id, country } = ctx.params;
    const url = `https://apps.apple.com/${country}/app/${id}`;

    const res = await got(url);
    const $ = cheerio.load(res.data);

    const webPlatform = $('.we-localnav__title__product').text();

    const appData = JSON.parse(Object.values(JSON.parse($('script#shoebox-media-api-cache-apps').text()))[0]);
    const appName = appData.d[0].attributes.name;
    const platform = Object.values(appData.d[0].attributes.platformAttributes)[0]; // may incldes osx appletvos, ios, etc.

    const items = platform.versionHistory.map((item) => ({
        title: `${appName} ${item.versionDisplay}`,
        description: item.releaseNotes?.replace(/\n/g, '<br>'),
        pubDate: parseDate(item.releaseTimestamp),
        guid: `apple:apps:update:${country}:${id}:${item.versionDisplay}`,
        link: url,
    }));

    ctx.state.data = {
        title: `${appName} for ${webPlatform === 'App Store' ? 'iOS' : 'macOS'} ${country === 'cn' ? '更新' : 'Update'}`,
        description: platform.description.standard?.replace(/\n/g, ' '),
        link: url,
        item: items,
    };

    ctx.state.json = {
        appData,
    };
};
