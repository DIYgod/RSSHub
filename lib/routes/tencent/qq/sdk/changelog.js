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

    const response = await got({
        method: 'get',
        url: link,
    });

    const $ = cheerio.load(response.data);
    const contents = $('.wp-editor')
        .children('p')
        .filter(function () {
            return $(this).text() !== '';
        });

    const resultItem = [];
    let item = {};

    contents.each(function () {
        const text = $(this).text();

        if ($(this).children('strong').length !== 0) {
            if (Object.keys(item).length > 0) {
                resultItem.push(item);

                item = {};
            }

            item.title = text;
        } else if (text !== '\n') {
            if (item.description === undefined) {
                item.description = '';
            }

            item.description += text.replace('\n', '') + '\n';
        }
    });

    resultItem.push(item);

    ctx.state.data = {
        title,
        link,
        item: resultItem,
    };
};
