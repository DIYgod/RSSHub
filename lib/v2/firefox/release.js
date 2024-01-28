const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const platformSlugs = {
    desktop: 'releasenotes',
    beta: 'beta/notes',
    nightly: 'nightly/notes',
    android: 'android/releasenotes',
    ios: 'ios/notes',
};

module.exports = async (ctx) => {
    const { platform = 'desktop' } = ctx.params;
    const devicePlatform = platform.replace('-', '/');

    const link = ['https://www.mozilla.org/en-US/firefox', Object.hasOwn(platformSlugs, devicePlatform) ? platformSlugs[devicePlatform] : devicePlatform].filter(Boolean).join('/');
    const response = await got.get(link);
    const $ = cheerio.load(response.data);
    const version = $('.c-release-version').text();
    const pubDate = parseDate($('.c-release-date').text(), 'MMMM D, YYYY');

    ctx.state.data = {
        title: `Firefox ${platform} release notes`,
        link,
        item: [
            {
                title: `Firefox ${platform} ${version} release notes`,
                link,
                description: $('.c-release-notes').html(),
                guid: `${platform} ${version}`,
                pubDate,
            },
        ],
    };
};
