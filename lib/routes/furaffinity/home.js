const got = require('@/utils/got');

module.exports = async (ctx) => {
    // 传入参数
    const type = String(ctx.params.type);
    const nsfw = String(ctx.params.nsfw);

    // 判断传入的参数nsfw
    let url = 'https://faexport.spangle.org.uk/home.json?sfw=1';
    if (nsfw === '1' || type === '1') {
        url = 'https://faexport.spangle.org.uk/home.json';
    }

    // 发起 HTTP GET 请求
    const response = await got({
        method: 'get',
        url,
        headers: {
            Referer: `https://faexport.spangle.org.uk/`,
        },
    });

    let data = response.data;

    // 判断传入的参数type，分别为：artwork、crafts、music、writing
    if (type === 'artwork') {
        data = data.artwork;
    } else if (type === 'crafts') {
        data = data.crafts;
    } else if (type === 'music') {
        data = data.music;
    } else if (type === 'writing') {
        data = data.writing;
    } else {
        data = data.artwork;
    }

    ctx.state.data = {
        // 源标题
        title: `Fur Affinity Home`,
        // 源链接
        link: `https://www.furaffinity.net/`,
        // 源说明
        description: `Fur Affinity Home`,

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
