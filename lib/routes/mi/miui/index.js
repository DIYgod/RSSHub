const got = require('@/utils/got');

const cacheLength = 5;

module.exports = async (ctx) => {
    const { type = 'release', device, region = 'cn' } = ctx.params;
    const releaseType = type === 'release' ? 'F' : 'X';
    const localeTypeName = type === 'release' ? '稳定版' : '开发版';
    const regionName = region === 'global' ? 'global' : 'cn';
    const cacheName = `RSSHubMIUIUpdate|${device}|${releaseType}|${regionName}`;

    const response = await got({
        method: 'get',
        baseUrl: 'http://update.miui.com',
        url: '/updates/miota-fullrom.php',
        params: {
            d: device,
            b: releaseType,
            r: regionName,
            l: 'zh_CN',
            n: '',
        },
    });

    const responseData = response.data;
    let oldPosts = [];
    try {
        oldPosts = JSON.parse(await ctx.cache.get(cacheName));
    } catch (_e) {
        // no need handle here: parseError
    }

    if (oldPosts === null) {
        oldPosts = [];
    }

    let item = oldPosts;

    if (oldPosts.length === 0 || oldPosts[0].description !== responseData.LatestFullRom.filename) {
        item = [
            {
                title: `${device} 有新的 ${localeTypeName}本: ${responseData.LatestFullRom.version}`,
                guid: responseData.LatestFullRom.md5,
                description: responseData.LatestFullRom.filename,
                link: responseData.LatestFullRom.descriptionUrl,
            },
            ...oldPosts,
        ];

        ctx.cache.set(cacheName, item.slice(0, cacheLength));
    }

    ctx.state.data = {
        title: `MIUI 更新 - ${device} - ${type === 'release' ? '稳定版' : '开发版'}`,
        link: 'http://www.miui.com/download.html',
        item,
    };
};
