const got = require('@/utils/got');

module.exports = async (ctx) => {
    const { type, category } = ctx.params;
    let url, title;
    if (type.startsWith('xcx')) {
        url = `https://developers.weixin.qq.com/community/ngi/question/list?page=1&tag=${category}`;
        title = `微信开放社区的小程序问题 - ${category}`;
    } else if (type.startsWith('xyx')) {
        url = `https://developers.weixin.qq.com/community/ngi/timeline/2/1/${category}?page=1&limit=10`;
        title = `微信开放社区的小游戏问题 - ${category}`;
    }

    const response = await got.get(url);

    const data = response.data.data;

    ctx.state.data = {
        // 源标题
        title,
        // 源链接
        link: url,
        // 源说明
        description: title,
        // 遍历此前获取的数据
        item: data.rows.map((item) => ({
            // 文章标题
            title: item.Title,
            // 文章正文
            description: `${item.Content}`,
            // 文章发布时间
            pubDate: new Date(item.CreateTime * 1000).toUTCString(),
            // 文章链接
            link: `https://developers.weixin.qq.com/community/develop/doc/${item.DocId}`,
        })),
    };
};
