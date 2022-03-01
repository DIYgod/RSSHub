const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'https://www.foreverblog.cn/feeds.html',
    });

    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('article[class="post post-type-normal"]');

    ctx.state.data = {
        title: '十年之约 - 订阅',
        link: 'https://www.foreverblog.cn/feeds.html',
        language: 'zh-cn',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    return {
                        title: item.find('a.post-title-link>span').text(),
                        description: item.find('div.post-author').text(),
                        link: item.find('a.post-title-link').attr('href'),
                        pubDate: item.find('time.post-time').text(),
                    };
                })
                .get(),
    };
};
