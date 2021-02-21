const got = require('@/utils/got');

module.exports = async (ctx) => {
    // 传入参数
    const username = String(ctx.params.username);

    // 发起 HTTP GET 请求
    const response = await got({
        method: 'get',
        url: `https://faexport.spangle.org.uk/user/${username}/commissions.json`,
        headers: {
            Referer: `https://faexport.spangle.org.uk/`,
        },
    });

    const data = response.data;

    ctx.state.data = {
        // 源标题
        title: `${username}'s Commissions`,
        // 源链接
        link: `https://www.furaffinity.net/commissions/${username}/`,
        // 源说明
        description: `Fur Affinity ${username}'s Commissions`,

        // 遍历此前获取的数据
        item: data.map((item) => ({
            // 标题
            title: item.title,
            // 正文
            description: `${item.description} <br> <img src="${item.submission.thumbnail}"> `,
            // 链接
            link: item.submission.link,
            // 作者
            author: username,
            // 由于源API未提供日期，故无pubDate
        })),
    };
};
