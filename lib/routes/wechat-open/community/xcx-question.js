const got = require('@/utils/got');

module.exports = async (ctx) => {
    const tag = ctx.params.tag;

    const response = await got({
        method: 'get',
        url: `https://developers.weixin.qq.com/community/ngi/question/list?page=1&tag=${tag}`,
        headers: {
            Referer: `https://developers.weixin.qq.com/community/develop/question`,
        },
    });

    const data = response.data.data;

    ctx.state.data = {
        // 源标题
        title: `微信开放社区的小程序问题 - ${tag}`,
        // 源链接
        link: `https://developers.weixin.qq.com/community/develop/question?tag=${tag}`,
        // 源说明
        description: `微信开放社区的小程序问题 - ${tag}`,
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
