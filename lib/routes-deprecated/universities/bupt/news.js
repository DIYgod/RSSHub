const config = require('@/config').value;
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const cookie = config.bupt.portal_cookie;
    const headers = {};
    if (cookie) {
        headers.cookie = cookie;
    }
    const response = await got({
        method: 'get',
        url: `https://webapp.bupt.edu.cn/extensions/wap/news/get-list.html?p=1&type=xnxw`,
        headers,
    });
    const out = [];
    const data = response.data.data;
    for (const value of Object.values(data)) {
        for (const item of value) {
            out.push({
                title: item.title,
                description: item.desc,
                pubDate: new Date(item.created * 1000).toUTCString(),
                link: `https://webapp.bupt.edu.cn/extensions/wap/news/detail.html?id=${item.id}&classify_id=xnxw`,
                author: item.author,
            });
        }
    }

    ctx.state.data = {
        title: '北京邮电大学校校园新闻',
        link: 'https://webapp.bupt.edu.cn/extensions/wap/news/list.html?p=1&type=xnxw',
        item: out,
    };
};
