const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const { platform } = ctx.params;
    let devicePlatform = platform.replace('-', '/');
    if (devicePlatform === 'desktop') {
        devicePlatform = '';
    }

    const link = `https://www.mozilla.org/en-US/firefox/${devicePlatform}/notes/`;
    const response = await got.get(link);
    const $ = cheerio.load(response.data);
    const version = $('.c-release-version').text();
    const pubDate = new Date($('.c-release-date').text()).toUTCString();

    ctx.state.data = {
        title: `Firefox ${platform} release note`,
        link,
        item: [
            {
                title: `Firefox ${platform} ${version} release note`,
                link,
                description: $('.c-release-notes').html(),
                guid: `${platform} ${version}`,
                pubDate,
            },
        ],
    };
};
