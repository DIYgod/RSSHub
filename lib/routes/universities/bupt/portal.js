const got = require('@/utils/got');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: `https://webapp.bupt.edu.cn/extensions/wap/news/get-list.html?p=1&type=tzgg`,
    });
    const out = [];
    const data = response.data.data;
    Object.values(data).forEach((value) => {
        value.forEach((item) => {
            out.push({
                title: item.title,
                description: item.text,
                pubDate: new Date(item.created * 1000).toUTCString(),
                link: `https://webapp.bupt.edu.cn/extensions/wap/news/detail.html?id=${item.id}&classify_id=tzgg`,
                author: item.author,
            });
        });
    });

    ctx.state.data = {
        title: '北京邮电大学信息门户',
        link: 'https://webapp.bupt.edu.cn/extensions/wap/news/list.html?p=1&type=tzgg',
        item: out,
    };
};
