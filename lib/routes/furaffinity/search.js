const got = require('@/utils/got');

// 发起 HTTP GET 请求
module.exports = async (ctx) => {
    // 传入参数
    const nsfw = String(ctx.params.nsfw);
    const keyword = String(ctx.params.keyword);

    // 添加参数keyword以及判断传入的参数nsfw
    let url = `https://faexport.spangle.org.uk/search.json?q=${keyword}?sfw=1`;
    if (nsfw === '1' || keyword === '1') {
        url = `https://faexport.spangle.org.uk/search.json?q=${keyword}`;
    }

    const response = await got({
        method: 'get',
        url: url,
        headers: {
            Referer: `https://faexport.spangle.org.uk/`,
        },
    });

    const data = response.data;

    ctx.state.data = {
        // 源标题
        title: `FA ${keyword}'s Search List`,
        // 源链接
        link: `https://www.furaffinity.net/search/?q=${keyword}`,
        // 源说明
        description: `Fur Affinity ${keyword}'s Search List`,

        // 遍历此前获取的数据
        item: data.map((item) => ({
            // 标题
            title: item.title,
            // 正文
            description: `<img src="${item.thumbnail}">`,
            // 链接
            link: item.link,
            // 作者
            author: item.name,
            // 由于源API未提供日期，故无pubDate
        })),
    };
};
