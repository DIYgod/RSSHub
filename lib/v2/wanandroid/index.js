const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    let pageSize = ctx.params.size ?? 20;
    if (pageSize > 40) {
        pageSize = 40;
    }
    // 发送 HTTP GET 请求到 API
    const response = await got(`https://www.wanandroid.com/article/list/0/json?page_size=${pageSize}`, {});
    // response.data 是上述请求返回的数据对象
    const data = response.data;
    const items = data.data.datas.map((item) => ({
        title: item.title,
        link: item.link,
        description: item.title,
        pubDate: parseDate(item.publishTime, 'YYYY-MM-DD HH:mm:ss'),
        author: item.author,
        categories: item.chapterName,
    }));

    ctx.state.data = {
        title: `玩 Android - 首页文章`,
        link: 'https://www.wanandroid.com/',
        item: items,
    };
};
