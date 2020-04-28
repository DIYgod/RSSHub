const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const type = ctx.params.type;
    const link = `https://developer.aliyun.com/group/${type}`;

    // 发起 HTTP GET 请求
    const response = await got({
        method: 'get',
        url: link,
    });

    const data = response.data;

    // 使用 cheerio 加载返回的 HTML
    const $ = cheerio.load(data);
    const title = $('div[class="header-information-title"]')
        .contents()
        .filter(function () {
            return this.nodeType === 3;
        })
        .text()
        .trim();
    const desc = $('div[class="header-information"]').find('span').last().text().trim();
    const list = $('ul[class^="content-tab-list"] > li');

    ctx.state.data = {
        title: `阿里云开发者社区-${title}`,
        link,
        description: `${desc}`,
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    return {
                        title: item.find('p').first().text().trim(),
                        link: item.find('a').attr('href'),
                    };
                })
                .get(),
    };
};
