const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const platform = ctx.params.platform;

    let title = '';
    let link = '';
    if (platform === 'iOS') {
        title = 'iOS SDK 历史变更';
        link = 'https://wiki.connect.qq.com/ios_sdk历史变更';
    } else if (platform === 'Android') {
        title = 'Android SDK 历史变更';
        link = 'https://wiki.connect.qq.com/android_sdk历史变更';
    } else {
        throw Error('not support platform');
    }

    const response = await got.get(link);

    const $ = cheerio.load(response.data);

    // 获取主要文本，并且过滤空行
    const contents = $('.wp-editor')
        .children('p')
        .filter((_, element) => $(element).text() !== '');

    const pList = [];
    const titleIndex = [];

    // 遍历文本 p 标签，并且获取标题索引
    contents.each((index, element) => {
        if ($(element).find('strong').length) {
            titleIndex.push(index);
        }

        pList.push($(element).text().replace('\n', ''));
    });

    // 用标题索引切割数组
    const changelogs = titleIndex.map((_, index) => {
        const section = pList.slice(titleIndex[index], titleIndex[index + 1]);
        const changelog = {
            title: section[0],
            description: section.slice(1).join('\n'),
        };

        return changelog;
    });

    ctx.state.data = {
        title,
        link,
        item: changelogs,
    };
};
