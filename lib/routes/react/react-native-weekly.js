const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const host = 'https://reactnative.cc';
    const response = await got({
        method: 'get',
        url: `${host}/issues.html`,
    });
    const data = response.data;
    const $ = cheerio.load(data);
    const newestHref = $('.past-issues-header>ul').first().find('li a').attr('href');
    const detailResponse = await got({
        method: 'get',
        url: `${host}${newestHref}`,
    });
    const $2 = cheerio.load(detailResponse.data);
    const list = $2('.mcnCaptionBottomContent .mcnTextContent a', 'body');

    ctx.state.data = {
        title: 'react-native-weekly',
        link: 'https://reactnative.cc',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    return {
                        title: item.text().replace(/\s{2}/g, ''),
                        link: item.attr('href'),
                    };
                })
                .get(),
    };
};
