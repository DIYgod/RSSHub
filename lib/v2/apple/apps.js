const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const { id, country } = ctx.params;
    const limit = ctx.query.limit ? parseInt(ctx.query.limit, 10) : 100;

    const rootUrl = 'https://apps.apple.com';
    const currentUrl = new URL(`${country}/app/${id}`, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = cheerio.load(response);

    const webPlatform = $('meta[property="og:site_name"]').prop('content');
    const subtitle = $('h2.whats-new__headline').text() || "What's New";

    const appData = JSON.parse(Object.values(JSON.parse($('script#shoebox-media-api-cache-apps').text()))[0]);
    const attributes = appData.d[0].attributes;
    const appName = attributes.name;
    const artistName = attributes.artistName;
    const platform = Object.values(attributes.platformAttributes)[0]; // may incldes osx appletvos, ios, etc.

    const items = platform.versionHistory.slice(0, limit).map((item) => ({
        title: `${appName} ${item.versionDisplay}`,
        link: currentUrl,
        description: item.releaseNotes?.replace(/\n/g, '<br>'),
        guid: `apple:apps:update:${country}:${id}:${item.versionDisplay}`,
        pubDate: parseDate(item.releaseTimestamp),
    }));

    const icon = new URL('favicon.ico', rootUrl).href;

    ctx.state.data = {
        item: items,
        title: `${appName} for ${/^App/.test(webPlatform) ? 'iOS' : 'macOS'} ${subtitle}`,
        link: currentUrl,
        description: platform.description.standard?.replace(/\n/g, ' '),
        language: $('html').prop('lang'),
        image: $('meta[property="og:image"]').prop('content'),
        icon,
        logo: icon,
        subtitle: appName,
        author: artistName,
    };

    ctx.state.json = {
        appData,
    };
};
