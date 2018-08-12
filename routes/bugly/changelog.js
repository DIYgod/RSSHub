const axios = require('../../utils/axios');
const config = require('../../config');

module.exports = async (ctx) => {
    const platform = ctx.params.platform;
    const APIUrl = `https://bugly.qq.com/v2/changeLog?pid=${platform}&type=1`;

    let webUrl = '';
    if (platform === '1') {
        webUrl = 'https://bugly.qq.com/docs/release-notes/release-android-bugly/';
    } else if (platform === '2') {
        webUrl = 'https://bugly.qq.com/docs/release-notes/release-ios-bugly/';
    }

    let title = '';
    if (platform === '1') {
        title = '腾讯 Bugly Android SDK 更新日志';
    } else if (platform === '2') {
        title = '腾讯 Bugly iOS SDK 更新日志';
    }

    const res = await axios({
        method: 'get',
        url: APIUrl,
        headers: {
            'User-Agent': config.ua,
            Referer: webUrl,
        },
    });

    const resultItem = res.data.ret.versionList.map(function(changelog) {
        const item = {};
        item.title = changelog.version + ' ' + changelog.createTime;

        let itemDesc = '';
        changelog.description.desc.forEach(function(desc) {
            itemDesc += desc;
            itemDesc += '\n';
        });
        item.description = itemDesc;
        return item;
    });

    ctx.state.data = {
        title: title,
        link: webUrl,
        item: resultItem,
    };
};
