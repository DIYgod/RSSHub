const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    // 传入参数
    const nsfw = String(ctx.params.nsfw);
    const username = String(ctx.params.username);

    // 添加参数username以及判断传入的参数nsfw
    let url = `https://faexport.spangle.org.uk/user/${username}/scraps.rss?sfw=1`;
    if (nsfw === '1') {
        url = `https://faexport.spangle.org.uk/user/${username}/scraps.rss`;
    }

    // 发起 HTTP GET 请求
    const response = await got({
        method: 'get',
        url: url,
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
        title: `${username}'s Scraps`,
        // 源链接
        link: `https://www.furaffinity.net/scraps/${username}/`,
        // 源说明
        description: `Fur Affinity ${username}'s Scraps`,

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
