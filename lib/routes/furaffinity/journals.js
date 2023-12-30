const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    // 传入参数
    const username = String(ctx.params.username);

    // 添加参数username 和 发起 HTTP GET 请求
    const response = await got({
        method: 'get',
        url: `https://faexport.spangle.org.uk/user/${username}/journals.rss`,
        headers: {
            Referer: `https://faexport.spangle.org.uk/`,
        },
    });

    // 使用 cheerio 加载返回的 HTML
    const data = response.data;
    const $ = cheerio.load(data, {
        xmlMode: true,
    });

    const list = $('item');

    ctx.state.data = {
        // 源标题
        title: `${username}'s Journals`,
        // 源链接
        link: `https://www.furaffinity.net/journals/${username}/`,
        // 源说明
        description: `Fur Affinity ${username}'s Journals`,

        // 遍历此前获取的数据
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    return {
                        title: item.find('title').text(),
                        description: item.find('description').text(),
                        link: item.find('link').text(),
                        pubDate: new Date(item.find('pubDate').text()).toUTCString(),
                        author: username,
                    };
                })
                .get(),
    };
};
