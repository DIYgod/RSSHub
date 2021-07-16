const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    // 发起 HTTP GET 请求
    const response = await got({
        method: 'get',
        url: 'https://feedback.minecraft.net/hc/en-us/sections/360001186971-Release-Changelogs'
    });

    const data = response.data;
    const $ = cheerio.load(data);
    const list = $('.article-list-link');

    ctx.state.data = {
        title: 'Minecraft Release Changelogs',
        link: 'https://feedback.minecraft.net/hc/en-us/sections/360001186971-Release-Changelogs',
        language: 'English',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    return {
                        title: item.find('a').text(),
                        link: item.find('.a').attr('href')
                    };
                })
                .get(),
    };
};
