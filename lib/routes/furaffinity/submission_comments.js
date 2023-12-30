const got = require('@/utils/got');

module.exports = async (ctx) => {
    // 传入参数
    const id = String(ctx.params.id);

    // 发起 HTTP GET 请求
    const response = await got({
        method: 'get',
        url: `https://faexport.spangle.org.uk/submission/${id}/comments.json`,
        headers: {
            Referer: `https://faexport.spangle.org.uk/`,
        },
    });

    // 发起第二个 HTTP GET 请求，用于获取该作品的标题
    const response2 = await got({
        method: 'get',
        url: `https://faexport.spangle.org.uk/submission/${id}.json`,
        headers: {
            Referer: `https://faexport.spangle.org.uk/`,
        },
    });

    const data = response.data;
    const data2 = response2.data;

    ctx.state.data = {
        // 源标题
        title: `${data2.title} - Submission Comments`,
        // 源链接
        link: `https://www.furaffinity.net/view/${id}/`,
        // 源说明
        description: `Fur Affinity ${data2.title} - Submission Comments`,

        // 遍历此前获取的数据
        item: data.map((item) => ({
            // 标题
            title: item.text,
            // 正文
            description: `<img src="${item.avatar}"> <br> ${item.name}: ${item.text}`,
            // 链接
            link: `https://www.furaffinity.net/view/${id}/`,
            // 作者
            author: item.name,
            // 日期
            pubDate: new Date(item.posted_at).toUTCString(),
        })),
    };
};
