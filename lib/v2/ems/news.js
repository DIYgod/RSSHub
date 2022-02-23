const got = require('@/utils/got');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'http://www.ems.com.cn/ems/news/listNews',
    });

    const items = response.data.map((item) => ({
        title: item.title,
        link: `http://www.ems.com.cn/ems/news/viewNews?id=${item.id}`,
        pubDate: item.postDate,
        description: item.content,
    }));

    ctx.state.data = {
        title: '中国邮政速递物流',
        link: 'http://www.ems.com.cn/',
        item: items,
    };
};
