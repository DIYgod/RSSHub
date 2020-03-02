const got = require('@/utils/got');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: `https://webapp.bupt.edu.cn/extensions/wap/news/get-list.html?p=1&type=xnxw`,
    });
    const out = [];
    const data = response.data.data;
    Object.values(data).forEach((value) => {
        value.forEach((item) => {
            out.push({
                title: item.title,
                description: item.desc,
                pubDate: new Date(item.created * 1000).toUTCString(),
                link: `https://webapp.bupt.edu.cn/extensions/wap/news/detail.html?id=${item.id}&classify_id=xnxw`,
                author: item.author,
            });
        });
    });

    ctx.state.data = {
        title: '北京邮电大学校校园新闻',
        link: 'https://webapp.bupt.edu.cn/extensions/wap/news/list.html?p=1&type=xnxw',
        item: out,
    };
};
